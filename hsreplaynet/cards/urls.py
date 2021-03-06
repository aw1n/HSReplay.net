from django.conf.urls import url
from . import views


card_detail = views.CardDetailView.as_view()
card_editor = views.CardEditorView.as_view()
card_gallery = views.CardGalleryView.as_view()
card_stats = views.CardStatsView.as_view()
my_card_stats = views.MyCardStatsView.as_view()


urlpatterns = [
	url(r"^$", card_stats, name="card_stats"),
	url(r"^counters/$", views.counters, name="deck_counters"),
	url(r"^editor/", card_editor, name="card_editor"),
	url(r"^mine/$", my_card_stats, name="my_card_stats"),
	url(r"^gallery/$", card_gallery, name="card_gallery"),
	url(r"^winrates/$", views.winrates, name="deck_winrates"),
	url(r"^(?P<pk>\w+)/(?P<slug>\w+)?", card_detail, name="card_detail"),
]
