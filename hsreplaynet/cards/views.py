from django.contrib.auth.decorators import login_required
from django.http.response import HttpResponseBadRequest
import json
from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.core.exceptions import ObjectDoesNotExist
from hearthstone.enums import CardClass
from hsreplaynet.cards.stats.winrates import get_head_to_head_winrates
from hsreplaynet.cards.models import Archetype
from hsreplaynet.features.decorators import view_requires_feature_access
from .models import Card, Deck
from .queries import CardCountersQueryBuilder
from hsreplaynet.cards.archetypes import guess_class


def archetypes(request):
	return render(request, "cards/deck_archetypes.html", {})


def popular_cards(request):
	return render(request, "cards/popular_cards.html", {})


def deckdetail(request, deck_id):
	try:
		deck = Deck.objects.get(id=deck_id)
	except Deck.DoesNotExist:
		raise Http404("Deck not found")
	cards = deck.card_id_list()
	if (len(cards)) != 30:
		raise Http404("Deck not found")
	decklist = ",".join(cards)
	deck_class = guess_class(deck)
	return render(request, "cards/deck_detail.html", {"deck": deck, "cards": decklist, "deck_class": deck_class.name})


def carddetail(request, card_id):
	try:
		card = Card.objects.get(id=card_id)
	except ObjectDoesNotExist:
		card = None
	if not card:
		raise Http404("Card not found")
	return render(request, "cards/card_detail.html", {"card": card})


@login_required
@view_requires_feature_access("winrates")
def canonicals(request):
	result = []
	archetypes = Archetype.objects.prefetch_related(
		"canonical_decks__deck__includes"
	).all()
	for archetype in archetypes:
		record = {
			"name": archetype.name,
			"archetype_id": archetype.id,
			"player_class_id": archetype.player_class,
			"player_class_name": CardClass(archetype.player_class).name
		}

		canonical_deck = archetype.canonical_decks.order_by('-created').first()
		if canonical_deck:
			record["representative_deck"] = {
				"card_ids": canonical_deck.deck.card_id_list(),
				"digest": canonical_deck.deck.digest
			}

		result.append(record)

	payload_str = json.dumps(result, indent=4, sort_keys=True)
	return HttpResponse(payload_str, content_type="application/json")


@login_required
@view_requires_feature_access("winrates")
def winrates(request):
	lookback = request.GET.get("lookback", "7")
	offset = request.GET.get("offset", "1")
	regions_param = request.GET.get("regions", "")
	if not regions_param:
		regions = ",".join((
			"144115193835963207",
			"144115198130930503",
			"144115202425897799",
			"144115211015832391")
		)
	else:
		regions = regions_param

	archetypes_param = request.GET.get("archetypes", "")
	if not archetypes_param:
		archetypes = ",".join([str(a.id) for a in Archetype.objects.all()])
	else:
		archetypes = archetypes_param

	game_types = request.GET.get("game_types", "2")
	max_rank = request.GET.get("max_rank", "25")
	min_rank = request.GET.get("min_rank", "-1")
	win_rates, frequencies, expected_winrates = get_head_to_head_winrates(
		lookback,
		offset,
		game_types,
		regions,
		min_rank,
		max_rank,
		archetypes
	)

	payload = {
		"win_rates": win_rates,
		"frequencies": frequencies,
		"expected_winrates": expected_winrates
	}

	payload_str = json.dumps(payload, indent=4, sort_keys=True)
	return HttpResponse(payload_str, content_type="application/json")


@login_required
@view_requires_feature_access("winrates")
def counters(request):
	query_builder = CardCountersQueryBuilder()
	context = {}

	cards_param = request.GET.get("cards", "")
	if not cards_param:
		return HttpResponseBadRequest("A 'cards' query parameter is required.")

	card_names = [c.strip('"') for c in cards_param.split(",")]
	cards = []
	for name in card_names:
		card = Card.objects.get_by_partial_name(name)
		if card:
			cards.append(card)
		else:
			return HttpResponseBadRequest("Unknown card '%s'" % name)

	context["cards"] = cards
	query_builder.cards = context["cards"]

	columns, counters_by_match_count = query_builder.result()

	context["counter_deck_columns"] = columns
	context["counters_by_match_count"] = counters_by_match_count

	return render(request, "cards/deck_counters.html", context)
