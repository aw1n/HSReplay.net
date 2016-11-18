from django import template
from django.conf import settings
from humanize import naturaldelta, naturaltime
from datetime import datetime
from urllib.parse import unquote, urlparse, parse_qs
from hearthstone.enums import CardType
from hsreplaynet.cards.models import Card, Deck
from hsreplaynet.cards.archetypes import guess_class
from hsreplaynet.games.models import GameReplay
from re import match, IGNORECASE
from django.contrib.staticfiles.templatetags.staticfiles import static


register = template.Library()


@register.filter
def human_duration(value):
	return naturaldelta(value)


@register.filter
def human_time(value):
	return naturaltime(datetime.now(value.tzinfo) - value)


@register.simple_tag
def joust_static(path):
	return settings.JOUST_STATIC_URL + path


@register.simple_tag
def get_featured_game():
	id = getattr(settings, "FEATURED_GAME_ID", None)
	if not id:
		return

	try:
		replay = GameReplay.objects.get(shortid=id)
	except GameReplay.DoesNotExist:
		replay = None
	return replay


@register.simple_tag
def hearthstonejson(build=None, locale="enUS"):
	if not build:
		build = "latest"
	return settings.HEARTHSTONEJSON_URL % {"build": build, "locale": locale}


@register.simple_tag
def setting(name):
	return getattr(settings, name, "")


@register.simple_tag(takes_context=True)
def static_absolute(context, value):
	request = context.request
	value = static(value)
	# check whether scheme is present according to RFC 3986
	if not match("[a-z]([a-z0-9+-.])*:", value, IGNORECASE):
		value = "%s://%s%s" % (request.scheme, request.get_host(), value)
	return value


@register.inclusion_tag("deck_list_meta_block.html", takes_context=True)
def render_deck_list_meta_for_digest_param(context):
	request = context.request
	deck_digest = request.GET.get("deck_digest", "")

	# Check if deck_digest is nested within the next param
	if not deck_digest:
		next_url_encoded = request.GET.get("next", "")
		if next_url_encoded:
			query_str = urlparse(unquote(next_url_encoded)).query
			query_params = parse_qs(query_str)
			if "deck_digest" in query_params:
				deck_digest_values = query_params["deck_digest"]
				if deck_digest_values:
					deck_digest = deck_digest_values[0]

	result = {
		"render_meta_tag": False
	}

	if deck_digest:
		deck = Deck.objects.filter(digest=deck_digest).first()
		if deck:
			class_guess = guess_class(deck)
			if class_guess:
				hero_card = Card.objects.filter(
					card_class=class_guess,
					type=CardType.HERO
				).first()
				if hero_card:
					result["render_meta_tag"] = True
					result["card_ids"] = ",".join(deck.card_id_list())
					result["hero_id"] = str(hero_card.id)

	return result
