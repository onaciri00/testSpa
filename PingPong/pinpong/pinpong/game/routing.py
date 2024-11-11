from django.urls import re_path
from .consumers import PingPongConsumer

websocket_urlpatterns = [
    re_path(r'ws/play/(?P<room_code>\w+)/$', PingPongConsumer.as_asgi()),
    re_path(r'ws/play/', PingPongConsumer.as_asgi()),
]
