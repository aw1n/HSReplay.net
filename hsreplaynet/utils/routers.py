from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class ReadReplicaRouter(object):
	def db_for_read(self, model, **hints):
		read_replica = getattr(settings, "DB_READ_REPLICA_NAME", None)

		if not read_replica:
			return "default"
		elif read_replica not in settings.DATABASES:
			raise ImproperlyConfigured("%s was not found in settings.DATABASES" % (read_replica))
		else:
			return read_replica

	def db_for_write(self, model, **hints):
		return "default"

	def allow_relation(self, obj1, obj2, **hints):
		# None indicates the router has no opinion
		return None

	def allow_migrate(self, db, app_label, model_name=None, **hints):
		read_replica = getattr(settings, "DB_READ_REPLICA_NAME", None)
		if read_replica:

			# Tell Django not to apply migrations to the read replica
			# They will be replicated when they are applied to the master
			if db == read_replica:
				return False

		return True


class UploadEventsRouter(object):
	"""
	A Django DB Router for interacting with the HSReplay.net uploads-db
	"""

	def db_for_read(self, model, **hints):
		uploads_db = getattr(settings, "UPLOADS_DB", None)

		if model._meta.app_label == "uploads" and uploads_db and uploads_db in settings.DATABASES:
			return uploads_db
		else:
			return "default"

	def db_for_write(self, model, **hints):
		uploads_db = getattr(settings, "UPLOADS_DB", None)

		if model._meta.app_label == "uploads" and uploads_db and uploads_db in settings.DATABASES:
			return uploads_db
		else:
			return "default"

	def allow_relation(self, obj1, obj2, **hints):
		if obj1._meta.app_label == "uploads" and obj2._meta.app_label == "uploads":
			# Models within the uploads-db can have relationships with each other
			return True

		# None indicates the router has no opinion
		return None

	def allow_migrate(self, db, app_label, model_name=None, **hints):
		uploads_db = getattr(settings, "UPLOADS_DB", None)

		if app_label == "uploads":
			return db == uploads_db

		return None
