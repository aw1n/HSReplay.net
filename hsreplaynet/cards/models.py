import hashlib
import json
import random
import string
from django.conf import settings
from django.db import connection, models
from django.dispatch.dispatcher import receiver
from django.urls import reverse
from django.utils.text import slugify
from django_intenum import IntEnumField
from hearthstone import enums
from shortuuid.main import int_to_string, string_to_int


ALPHABET = string.ascii_letters + string.digits


class CardManager(models.Manager):
	def random(self, cost=None, collectible=True, card_class=None):
		"""
		Return a random Card.

		Keyword arguments:
		cost: Restrict the set of candidate cards to cards of this mana cost.
		By default will be in the range 1 through 8 inclusive.
		collectible: Restrict the set of candidate cards to the set of collectible cards.
		card_class: Restrict the set of candidate cards to this class.
		"""
		cost = random.randint(1, 8) if cost is None else cost
		cards = super(CardManager, self).filter(collectible=collectible)
		cards = cards.exclude(type=enums.CardType.HERO).filter(cost=cost)

		if card_class is not None:
			cards = [c for c in cards if c.card_class in (0, card_class)]

		if cards:
			return random.choice(cards)

	def get_valid_deck_list_card_set(self):
		if not hasattr(self, "_usable_cards"):
			card_list = Card.objects.filter(collectible=True).exclude(type=enums.CardType.HERO)
			self._usable_cards = set(c[0] for c in card_list.values_list("id"))

		return self._usable_cards

	def get_by_partial_name(self, name):
		"""Makes a best guess attempt to return a card based on a full or partial name."""
		return Card.objects.filter(collectible=True).filter(name__icontains=name).first()


class Card(models.Model):
	id = models.CharField(primary_key=True, max_length=50)
	dbf_id = models.IntegerField(null=True, unique=True, db_index=True)
	objects = CardManager()

	name = models.CharField(max_length=50)
	description = models.TextField(blank=True)
	flavortext = models.TextField(blank=True)
	how_to_earn = models.TextField(blank=True)
	how_to_earn_golden = models.TextField(blank=True)
	artist = models.CharField(max_length=255, blank=True)

	card_class = IntEnumField(enum=enums.CardClass, default=enums.CardClass.INVALID)
	card_set = IntEnumField(enum=enums.CardSet, default=enums.CardSet.INVALID)
	faction = IntEnumField(enum=enums.Faction, default=enums.Faction.INVALID)
	race = IntEnumField(enum=enums.Race, default=enums.Race.INVALID)
	rarity = IntEnumField(enum=enums.Rarity, default=enums.Rarity.INVALID)
	type = IntEnumField(enum=enums.CardType, default=enums.CardType.INVALID)

	collectible = models.BooleanField(default=False)
	battlecry = models.BooleanField(default=False)
	divine_shield = models.BooleanField(default=False)
	deathrattle = models.BooleanField(default=False)
	elite = models.BooleanField(default=False)
	evil_glow = models.BooleanField(default=False)
	inspire = models.BooleanField(default=False)
	forgetful = models.BooleanField(default=False)
	one_turn_effect = models.BooleanField(default=False)
	poisonous = models.BooleanField(default=False)
	ritual = models.BooleanField(default=False)
	secret = models.BooleanField(default=False)
	taunt = models.BooleanField(default=False)
	topdeck = models.BooleanField(default=False)

	atk = models.IntegerField(default=0)
	health = models.IntegerField(default=0)
	durability = models.IntegerField(default=0)
	cost = models.IntegerField(default=0)
	windfury = models.IntegerField(default=0)

	spare_part = models.BooleanField(default=False)
	overload = models.IntegerField(default=0)
	spell_damage = models.IntegerField(default=0)

	craftable = models.BooleanField(default=False)

	class Meta:
		db_table = "card"

	@classmethod
	def from_cardxml(cls, card, save=False):
		obj = cls(id=card.id)
		obj.update_from_cardxml(card, save=save)
		return obj

	def __str__(self):
		return self.name

	@property
	def slug(self):
		return slugify(self.name)

	def get_absolute_url(self):
		return reverse("card_detail", kwargs={"pk": self.dbf_id, "slug": self.slug})

	def update_from_cardxml(self, cardxml, save=False):
		for k in dir(cardxml):
			if k.startswith("_"):
				continue
			# Transfer all existing CardXML attributes to our model
			if hasattr(self, k):
				setattr(self, k, getattr(cardxml, k))

		if save:
			self.save()


class DeckManager(models.Manager):
	def get_or_create_from_id_list(
		self,
		id_list,
		hero_id=None,
		game_type=None,
		classify_into_archetype=False
	):
		deck, created = self._get_or_create_deck_from_db(id_list)

		archetypes_enabled = settings.ARCHETYPE_CLASSIFICATION_ENABLED
		if archetypes_enabled and classify_into_archetype and created:
			player_class = self._convert_hero_id_to_player_class(hero_id)
			format = self._convert_game_type_to_format(game_type)
			self.classify_deck_with_archetype(deck, player_class, format)

		return deck, created

	def _get_or_create_deck_from_db(self, id_list):
		if len(id_list):
			# This native implementation in the DB is to reduce the volume
			# of DB chatter between Lambdas and the DB
			cursor = connection.cursor()
			cursor.callproc("get_or_create_deck", (id_list,))
			result_row = cursor.fetchone()
			deck_id = int(result_row[0])
			created_ts = result_row[1]
			digest = result_row[2]
			created = result_row[3]
			deck_size = result_row[4]
			cursor.close()
			d = Deck(id=deck_id, created=created_ts, digest=digest, size=deck_size)
			return d, created
		else:
			digest = generate_digest_from_deck_list(id_list)
			return Deck.objects.get_or_create(digest=digest)

	def _convert_hero_id_to_player_class(self, hero_id):
		if hero_id:
			return Card.objects.get(id=hero_id).card_class
		return enums.CardClass.INVALID

	def _convert_game_type_to_format(self, game_type):
		# TODO: Move this to be a helper on the enum itself
		STANDARD_GAME_TYPES = [
			enums.BnetGameType.BGT_CASUAL_STANDARD,
			enums.BnetGameType.BGT_RANKED_STANDARD,
		]
		WILD_GAME_TYPES = [
			enums.BnetGameType.BGT_CASUAL_WILD,
			enums.BnetGameType.BGT_RANKED_WILD,
			enums.BnetGameType.BGT_ARENA
		]

		if game_type:
			if game_type in STANDARD_GAME_TYPES:
				return enums.FormatType.FT_STANDARD
			elif game_type in WILD_GAME_TYPES:
				return enums.FormatType.FT_WILD

		return enums.FormatType.FT_UNKNOWN

	def classify_deck_with_archetype(self, deck, player_class, format):
		from hsreplaynet.cards.archetypes import classify_deck
		archetype = classify_deck(deck, player_class, format)
		if archetype:
			deck.archetype = archetype
			deck.save()

	def get_by_shortid(self, shortid):
		digest = hex(string_to_int(shortid, ALPHABET))[2:].rjust(32, "0")
		return Deck.objects.get(digest=digest)


def generate_digest_from_deck_list(id_list):
	sorted_cards = sorted(id_list)
	m = hashlib.md5()
	m.update(",".join(sorted_cards).encode("utf-8"))
	return m.hexdigest()


class Deck(models.Model):
	"""
	Represents an abstract collection of cards.

	The default sorting for cards when iterating over a deck is by
	mana cost and then alphabetical within cards of equal cost.
	"""

	id = models.BigAutoField(primary_key=True)
	objects = DeckManager()
	cards = models.ManyToManyField(Card, through="Include")
	digest = models.CharField(max_length=32, unique=True)
	created = models.DateTimeField(auto_now_add=True, null=True, blank=True)
	archetype = models.ForeignKey("Archetype", null=True, on_delete=models.SET_NULL)
	size = models.IntegerField(null=True)

	def __str__(self):
		return repr(self)

	def __repr__(self):
		values = self.includes.values("card__name", "count", "card__cost")
		alpha_sorted = sorted(values, key=lambda t: t["card__name"])
		mana_sorted = sorted(alpha_sorted, key=lambda t: t["card__cost"])
		value_map = ["%s x %i" % (c["card__name"], c["count"]) for c in mana_sorted]
		return "[%s]" % (", ".join(value_map))

	def __iter__(self):
		# sorted() is stable, so sort alphabetically first and then by mana cost
		alpha_sorted = sorted(self.cards.all(), key=lambda c: c.name)
		mana_sorted = sorted(alpha_sorted, key=lambda c: c.cost)
		return mana_sorted.__iter__()

	@property
	def shortid(self):
		return int_to_string(int(self.digest, 16), ALPHABET)

	@property
	def all_includes(self):
		"""
		Use instead of .includes if you know you will use all of them
		this will prefetch the related cards. (eg. in a deck list)
		"""
		fields = ("id", "count", "deck_id", "card__name")
		return self.includes.all().select_related("card").only(*fields)

	def get_absolute_url(self):
		return reverse("deck_detail", kwargs={"id": self.id})

	def save(self, *args, **kwargs):
		EMPTY_DECK_DIGEST = "d41d8cd98f00b204e9800998ecf8427e"
		if self.digest != EMPTY_DECK_DIGEST and self.includes.count() == 0:
			# A client has set a digest by hand, so don't recalculate it.
			return super(Deck, self).save(*args, **kwargs)
		else:
			self.digest = generate_digest_from_deck_list(self.card_id_list())
			return super(Deck, self).save(*args, **kwargs)

	def card_dbf_id_list(self):
		result = []

		includes = self.includes.values_list("card__dbf_id", "count")
		for id, count in includes:
			for i in range(count):
				result.append(id)

		return result

	def card_id_list(self):
		result = []

		includes = self.includes.values_list("card__id", "count")
		for id, count in includes:
			for i in range(count):
				result.append(id)

		return result

	def as_dbf_json(self, serialized=True):
		"""Serialize the deck list for storage in Redshift"""
		result = []
		for include in self.includes.all():
			result.append([include.card.dbf_id, include.count])

		if serialized:
			# separators=(",", ":") creates compact JSON encoding
			return json.dumps(result, separators=(",", ":"))
		else:
			return result


@receiver(models.signals.post_save, sender=Deck)
def update_deck_size_field(sender, instance, **kwargs):
	current_deck_size = sum(i.count for i in instance.includes.all())

	if instance.size != current_deck_size:
		instance.size = current_deck_size
		# Make sure to only save when updating to prevent recursion
		instance.save()


class Include(models.Model):
	id = models.BigAutoField(primary_key=True)
	deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="includes")
	card = models.ForeignKey(Card, on_delete=models.PROTECT, related_name="included_in")
	count = models.IntegerField(default=1)

	def __str__(self):
		return "%s x %s" % (self.card.name, self.count)

	class Meta:
		unique_together = ("deck", "card")


class ArchetypeManager(models.Manager):
	def archetypes_for_class(self, player_class, format):
		result = {}

		for archetype in Archetype.objects.filter(player_class=player_class):
			canonical_decks = archetype.get_canonical_decks(format)
			if canonical_decks:
				result[archetype] = canonical_decks

		return result


class Archetype(models.Model):
	"""
	Archetypes cluster decks with minor card variations that all share the same strategy
	into a common group.

	E.g. 'Freeze Mage', 'Miracle Rogue', 'Pirate Warrior', 'Zoolock', 'Control Priest'
	"""

	id = models.BigAutoField(primary_key=True)
	objects = ArchetypeManager()
	name = models.CharField(max_length=250, blank=True)
	player_class = IntEnumField(enum=enums.CardClass, default=enums.CardClass.INVALID)

	def get_canonical_decks(self, format=enums.FormatType.FT_STANDARD, as_of=None):
		if as_of is None:
			canonicals = self.canonical_decks.filter(
				format=format,
			).order_by("-created").prefetch_related("deck__includes").all()
		else:
			canonicals = self.canonical_decks.filter(
				format=format,
				created__lte=as_of
			).order_by("-created").prefetch_related("deck__includes").all()

		if canonicals:
			return [c.deck for c in canonicals]
		else:
			return None

	def __str__(self):
		return self.name


class CanonicalDeck(models.Model):
	"""
	The CanonicalDeck for an Archetype is the list of cards that is most commonly
	associated with that Archetype.

	The canonical deck for an Archetype may evolve incrementally over time and is likely to
	evolve more rapidly when new card sets are first released.
	"""

	id = models.BigAutoField(primary_key=True)
	archetype = models.ForeignKey(
		Archetype,
		related_name="canonical_decks",
		on_delete=models.CASCADE
	)
	deck = models.ForeignKey(
		Deck,
		related_name="canonical_for_archetypes",
		on_delete=models.PROTECT
	)
	created = models.DateTimeField(auto_now_add=True)
	format = IntEnumField(enum=enums.FormatType, default=enums.FormatType.FT_STANDARD)
