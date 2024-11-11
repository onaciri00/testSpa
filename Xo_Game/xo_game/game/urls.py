from django.urls import path
from .views import RoomListCreateAPIView

urlpatterns = [
    path('api/rooms/', RoomListCreateAPIView.as_view()),
]
