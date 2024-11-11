

from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Room
from .serializers import RoomSerializer

# Create your views here.

class RoomListCreateAPIView(APIView):
    
    def get(self, request):
        rooms = Room.objects.filter(players__lt=2)
        print("it is empty", rooms.exists())
        print("room size is ", rooms.__sizeof__())
        if rooms.exists():
            room = rooms.first()
            room.players += 1
            print("room player are ", room.players)
            room.save()
            serializer = RoomSerializer(room)
            return Response(serializer.data)
        return Response({"message": "No available rooms"}, status=404)

    def post(self, request):
        print("Create room")
        code = request.data.get('code')
        print("code of  room", code)
        room = Room.objects.create(code=code)
        print("room player is ", room.players)
        serializer = RoomSerializer(room)
        print("*-------------------------------------------------------------------------*")
        return Response(serializer.data)