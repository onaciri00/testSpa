from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('wss/friend_requests/', consumers.FriendRequestConsumer.as_asgi()),
]
