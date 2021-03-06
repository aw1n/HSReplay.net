from datetime import datetime
from django.contrib.admin.views.decorators import staff_member_required
from django.http import Http404, HttpResponseForbidden, JsonResponse
from django.views.decorators.http import condition
from hsredshift.analytics.filters import Region
from hsreplaynet.cards.models import Deck
from hsreplaynet.features.decorators import view_requires_feature_access
from hsreplaynet.utils import influx, log
from .processing import (
	evict_locks_cache, execute_query, get_concurrent_redshift_query_queue_semaphore,
	get_redshift_catalogue
)


@staff_member_required
def evict_query_from_cache(request, name):
	query = get_redshift_catalogue().get_query(name)
	if not query:
		raise Http404("No query named: %s" % name)

	parameterized_query = query.build_full_params(request.GET.dict())
	parameterized_query.evict_cache()

	# Clear out any lingering dogpile locks on this query
	evict_locks_cache(parameterized_query)

	return JsonResponse({"msg": "OK"})


@staff_member_required
def release_semaphore(request, name):
	semaphore = get_concurrent_redshift_query_queue_semaphore(name)
	if semaphore:
		semaphore.reset()
	return JsonResponse({"msg": "OK"})


def fetch_query_result_as_of(request, name):
	parameterized_query = _get_query_and_params(request, name)
	if isinstance(parameterized_query, HttpResponseForbidden):
		return None

	return parameterized_query.result_as_of


def _get_query_and_params(request, name):
	query = get_redshift_catalogue().get_query(name)
	if not query:
		raise Http404("No query named: %s" % name)

	supplied_params = request.GET.dict()
	if "deck_id" in supplied_params and not supplied_params["deck_id"].isdigit():
		# We got sent a shortid, so we need to translate it into a deck_id int
		deck = Deck.objects.get_by_shortid(supplied_params["deck_id"])
		supplied_params["deck_id"] = str(deck.id)

	if query.is_personalized:
		if request.user and not request.user.is_fake:

			if "Region" not in supplied_params:
				default_pegasus_account = request.user.pegasusaccount_set.first()

				if default_pegasus_account:
					supplied_params["Region"] = default_pegasus_account.region.name
					supplied_params["account_lo"] = default_pegasus_account.account_lo
				else:
					raise Http404("User does not have any Pegasus Accounts.")
			else:
				user_owns_pegasus_account = request.user.pegasusaccount_set.filter(
					region__exact=int(supplied_params["Region"]),
					account_lo__exact=int(supplied_params["account_lo"])
				).exists()
				if not user_owns_pegasus_account:
					return HttpResponseForbidden()

			if supplied_params["Region"].isdigit():
				region_member = Region.from_int(int(supplied_params["Region"]))
				supplied_params["Region"] = region_member.name

			personal_parameterized_query = query.build_full_params(supplied_params)

			if not user_is_eligible_for_query(
				request.user,
				query,
				personal_parameterized_query
			):
				return HttpResponseForbidden()

			return personal_parameterized_query

		else:
			# Anonymous or Fake Users Can Never Request Personal Stats
			return HttpResponseForbidden()
	else:

		parameterized_query = query.build_full_params(supplied_params)
		if not user_is_eligible_for_query(request.user, query, parameterized_query):
			return HttpResponseForbidden()

		return parameterized_query


def user_is_eligible_for_query(user, query, params):
	if user.is_staff:
		return True

	if params.has_premium_values:
		return user.is_authenticated and user.is_premium
	else:
		return True


@view_requires_feature_access("carddb")
@condition(last_modified_func=fetch_query_result_as_of)
def fetch_query_results(request, name):
	parameterized_query = _get_query_and_params(request, name)
	if isinstance(parameterized_query, HttpResponseForbidden):
		return parameterized_query

	return _fetch_query_results(parameterized_query)


@view_requires_feature_access("carddb")
@condition(last_modified_func=fetch_query_result_as_of)
def fetch_local_query_results(request, name):
	# This end point is intended only for administrator use.
	# It provides an entry point to force a query to be run locally
	# and by-pass all of the in-flight short circuits.
	# This can be critical in case a query is failing on Lambda, and
	# repeated attempts to run it on lambda are causing it's in-flight status
	# to always be true.
	parameterized_query = _get_query_and_params(request, name)
	return _fetch_query_results(parameterized_query, run_local=True)


def _fetch_query_results(parameterized_query, run_local=False):
	is_cache_hit = parameterized_query.result_available
	triggered_refresh = False

	if is_cache_hit:
		if parameterized_query.result_is_stale:
			triggered_refresh = True
			execute_query(parameterized_query, run_local)

		staleness = (datetime.utcnow() - parameterized_query.result_as_of).total_seconds()
		query_fetch_metric_fields = {
			"count": 1,
			"staleness": int(staleness)
		}
		query_fetch_metric_fields.update(
			parameterized_query.supplied_non_filters_dict
		)

		influx.influx_metric(
			"redshift_response_payload_staleness",
			query_fetch_metric_fields,
			query_name=parameterized_query.query_name,
			**parameterized_query.supplied_filters_dict
		)

		response = JsonResponse(
			parameterized_query.response_payload,
			json_dumps_params=dict(separators=(",", ":"),)
		)
	else:
		execute_query(parameterized_query, run_local)
		result = {"msg": "Query is processing. Check back later."}
		response = JsonResponse(result, status=202)

	log.info("Query: %s Cache Hit: %s Is Stale: %s" % (
		parameterized_query.cache_key,
		is_cache_hit,
		triggered_refresh
	))

	query_fetch_metric_fields = {
		"count": 1,
	}
	query_fetch_metric_fields.update(
		parameterized_query.supplied_non_filters_dict
	)

	influx.influx_metric(
		"redshift_query_fetch",
		query_fetch_metric_fields,
		cache_hit=is_cache_hit,
		query_name=parameterized_query.query_name,
		triggered_refresh=triggered_refresh,
		**parameterized_query.supplied_filters_dict
	)

	return response
