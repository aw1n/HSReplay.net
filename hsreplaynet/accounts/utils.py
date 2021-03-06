from djstripe.models import Customer
from hsreplaynet.utils import log


def merge_users(base_user, user):
	"""
	Merge user into base_user
	"""
	def do_queryset(qs, **kwargs):
		if not kwargs:
			kwargs = {"user": base_user}
		ret = qs.update(**kwargs)
		log.info("Merging %r -> %r: %r", user, base_user, ret)
		return ret

	# Auth tokens
	do_queryset(user.auth_tokens)

	# Replays
	do_queryset(user.replays)

	# Comments
	do_queryset(user.comment_comments)
	do_queryset(user.comment_flags)

	# Pegasus Accounts
	do_queryset(user.pegasusaccount_set)

	# Emails
	do_queryset(user.emailaddress_set)

	# Social accounts
	do_queryset(user.socialaccount_set)

	# Webhooks
	do_queryset(user.webhooks)

	# Stripe customers

	# Always delete livemode customers
	Customer.objects.filter(livemode=False, subscriber=user).delete()

	customers = Customer.objects.filter(livemode=True)
	user_has_customer = customers.filter(subscriber=user).exists()
	base_user_has_customer = customers.filter(subscriber=base_user).exists()

	if user_has_customer and base_user_has_customer:
		cus1 = customers.get(subscriber=user)
		cus2 = customers.get(subscriber=base_user)
		log.warn("Found customers for both users: %r and %r. Merge manually!", cus1, cus2)
	elif user_has_customer:
		cus = customers.get(subscriber=user)
		log.info("Moving Customer %r from user %r to user %r", cus, user, base_user)
		cus.subscriber = base_user
		cus.metadata["django_account"] = str(base_user.pk)
		cus.save()
	elif base_user_has_customer:
		log.info("Found Stripe customer on %r, nothing to do.", base_user)
	else:
		log.info("No Stripe customers to merge.")
