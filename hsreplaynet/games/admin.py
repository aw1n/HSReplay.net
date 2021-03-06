from django.contrib import admin
from hsreplaynet.admin.paginators import EstimatedCountPaginator
from hsreplaynet.uploads.models import UploadEvent
from hsreplaynet.uploads.processing import queue_upload_event_for_reprocessing
from hsreplaynet.utils.admin import admin_urlify as urlify, set_user
from .models import GameReplay, GlobalGame, GlobalGamePlayer, PegasusAccount


def queue_for_reprocessing(admin, request, queryset):
	for obj in queryset:
		uploads = obj.uploads.all()
		if uploads:
			queue_upload_event_for_reprocessing(uploads[0])


queue_for_reprocessing.short_description = "Queue original upload for reprocessing"


class GlobalGamePlayerInline(admin.StackedInline):
	model = GlobalGamePlayer
	raw_id_fields = ("hero", "pegasus_account")
	readonly_fields = ("deck_list", )
	max_num = 2
	show_change_link = True


class UploadEventInline(admin.StackedInline):
	model = UploadEvent
	extra = 0
	show_change_link = True


class GameReplayInline(admin.StackedInline):
	model = GameReplay
	extra = 0
	raw_id_fields = ("upload_token", "user", )
	readonly_fields = ("opponent_revealed_deck",)
	show_change_link = True


@admin.register(GameReplay)
class GameReplayAdmin(admin.ModelAdmin):
	actions = (set_user, queue_for_reprocessing)
	list_display = (
		"__str__", urlify("user"), urlify("global_game"), "visibility",
		"build", "client_handle", "views", "replay_xml", "upload_event"
	)
	list_filter = (
		"visibility", "won", "spectator_mode", "disconnected",
		"reconnecting", "is_deleted"
	)
	raw_id_fields = (
		"upload_token", "user", "global_game"
	)
	readonly_fields = ("shortid", "upload_event", "opponent_revealed_deck")
	search_fields = ("shortid", "global_game__players__name", "user__username")
	show_full_result_count = False
	paginator = EstimatedCountPaginator

	def get_queryset(self, request):
		qs = super().get_queryset(request)
		return qs.prefetch_related("global_game__players")

	def upload_event(self, obj):
		return '<a href="%s">%s</a>' % (obj.upload_event_admin_url, obj.shortid)
	upload_event.allow_tags = True
	upload_event.short_description = "Upload Event"


@admin.register(GlobalGame)
class GlobalGameAdmin(admin.ModelAdmin):
	list_display = (
		"__str__", "match_start", "game_type", "build", "server_version",
		"game_handle", "ladder_season", "scenario_id", "num_turns",
	)
	list_filter = (
		"game_type", "ladder_season", "brawl_season", "build",
	)
	readonly_fields = ("digest", )
	search_fields = ("replays__shortid", "players__name")
	inlines = (GlobalGamePlayerInline, GameReplayInline)
	show_full_result_count = False
	ordering = None
	paginator = EstimatedCountPaginator

	def get_queryset(self, request):
		qs = super().get_queryset(request)
		return qs.prefetch_related("players")


@admin.register(GlobalGamePlayer)
class GlobalGamePlayerAdmin(admin.ModelAdmin):
	actions = (set_user, )
	list_display = (
		"__str__", "account_lo", urlify("hero"), "is_first",
		"rank", "stars", "legend_rank", "final_state"
	)
	list_filter = ("is_ai", "is_first", "hero_premium", "final_state", "player_id")
	raw_id_fields = ("game", "hero", "deck_list", "pegasus_account")
	search_fields = ("name", )
	show_full_result_count = False
	paginator = EstimatedCountPaginator


@admin.register(PegasusAccount)
class PegasusAccountAdmin(admin.ModelAdmin):
	list_display = (
		"__str__", urlify("user"), "account_lo", "account_hi", "region", "created", "modified"
	)
	list_filter = ("region", )
	raw_id_fields = ("user", )
	search_fields = ("battletag", )
	readonly_fields = ("created", "modified")
	show_full_result_count = False
	paginator = EstimatedCountPaginator
