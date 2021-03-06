from django.db import models
from django_intenum import IntEnumField
from hearthstone.enums import Booster
from hsreplaynet.accounts.models import User
from hsreplaynet.cards.models import Card


class Pack(models.Model):
	id = models.BigAutoField(primary_key=True)
	booster_type = IntEnumField(enum=Booster)
	date = models.DateTimeField()
	cards = models.ManyToManyField(Card, through="packs.PackCard")
	user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
	account_hi = models.BigIntegerField()
	account_lo = models.BigIntegerField()

	def __str__(self):
		cards = self.cards.all()
		if not cards:
			return "(Empty pack)"
		return ", ".join(str(card) for card in cards)


class PackCard(models.Model):
	id = models.BigAutoField(primary_key=True)
	pack = models.ForeignKey(Pack)
	card = models.ForeignKey(Card)
	premium = models.BooleanField()
