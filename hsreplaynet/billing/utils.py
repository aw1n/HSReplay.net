from django.dispatch import receiver
from djstripe import signals
from hsreplaynet.analytics.processing import (
	PremiumUserCacheWarmingContext, warm_redshift_cache_for_user_context
)
from hsreplaynet.utils import log


@receiver(signals.WEBHOOK_SIGNALS["customer.subscription.created"])
def on_premium_purchased(sender, event, **kwargs):
	if event.customer and event.customer.subscriber:
		user = event.customer.subscriber
		log.info("Received premium purchased signal for user: %s" % user.username)
		log.info("Scheduling personalized stats for immediate cache warming.")
		context = PremiumUserCacheWarmingContext.from_user(user)
		warm_redshift_cache_for_user_context(context)


def get_premium_cache_warming_contexts_from_subscriptions():
	result = []
	from djstripe.models import Subscription
	for subscription in Subscription.objects.active():
		user = subscription.customer.subscriber
		if user:
			context = PremiumUserCacheWarmingContext.from_user(user)
			result.append(context)
	return result
