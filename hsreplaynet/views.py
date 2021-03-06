from django.contrib.staticfiles.templatetags.staticfiles import static
from django.views.generic import TemplateView
from .utils.html import RequestMetaMixin


SITE_DESCRIPTION = "Watch and share Hearthstone replays directly from your web browser!"


class HomeView(TemplateView):
	template_name = "home.html"

	def get(self, request):
		thumbnail = static("images/hsreplay-thumbnail.png")
		request.head.base_title = ""
		request.head.title = "HSReplay.net: Share your Hearthstone games!"
		request.head.add_meta(
			{"name": "description", "content": SITE_DESCRIPTION},
			{"property": "og:description", "content": SITE_DESCRIPTION},
			{"property": "og:image", "content": request.build_absolute_uri(thumbnail)},
			{"property": "og:image:width", "content": 400},
			{"property": "og:image:height", "content": 400},
			{"name": "twitter:card", "content": "summary"},
		)
		return super().get(request)


class DownloadsView(RequestMetaMixin, TemplateView):
	template_name = "downloads.html"
	title = "Downloads"
	stylesheets = (
		"https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css",
	)
