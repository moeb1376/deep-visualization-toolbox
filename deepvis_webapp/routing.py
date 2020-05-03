from channels.routing import ProtocolTypeRouter, URLRouter
import caffevis_API.routing

application = ProtocolTypeRouter({
	'http': URLRouter(caffevis_API.routing.urlpatterns),
})
