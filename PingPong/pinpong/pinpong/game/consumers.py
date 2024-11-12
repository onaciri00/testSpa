import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Room
import asyncio, math
from datetime import datetime
from channels.layers import get_channel_layer
import requests

connected_players = {}
width = 600
height = 300
hh = 80
ww = 5
paddle_speed = 1
score_to_win = 5
pad_num = 0
class ball:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.r = 10
        self.angl = 35
        self.speed = 0.85
        self.vx = math.cos(self.angl * math.pi / 180) * self.speed
        self.vy = math.sin(self.angl * math.pi / 180) * self.speed
    def serialize_ball(self):
        return{
            'x':self.x,
            'y':self.y
        }


class paddle:
    def __init__(self, x, y, min, max):
        self.x = x
        self.y = y
        self.min = min
        self.max = max
        self.h = hh
        self.w = ww
        self.vy = 0
        self.score = 0

    def change_direction(self, data):
        if (data == 'Up'):
            self.vy = -paddle_speed
        elif (data == 'Down'):
            self.vy = paddle_speed
        elif (data == 'Stop'):
            self.vy = 0

    def move(self):
        if self.vy < 0:
            if self.y + self.vy > self.min:
                self.y += self.vy
            else:
                self.y = self.min
        else:
            if self.y + self.vy < self.max - self.h:
                self.y += self.vy
            else:
                self.y = self.max - self.h

    def serialize_paddle(self):
        return {
            'x': self.x,
            'y': self.y,
            'score':self.score,
        }



class   Match:
    def __init__(self, N):
        self.starting = False
        self.b = ball(width / 2, height / 2)
        self.p1 = paddle(0, (height - hh) / 2, 0, height)
        self.p2 = paddle(width - ww, (height - hh) / 2, 0, height)

    def move(self):
        if (self.b.x + self.b.r < ww):
            self.p2.score += 1
            self.b.x = width / 2  # Reset ball to center of board
            self.b.y = height / 2
            self.b.vx = abs(self.b.vx)  # Launch ball to the right (toward player 2)
            self.b.vy = -self.b.vy  # Reverse vertical direction for variety
        if self.b.x - self.b.r > width - ww:  # Ball goes past right boundary, first player scores
            self.p1.score += 1
            self.b.x = width / 2  # Reset ball to center of board
            self.b.y = height / 2
            self.b.vx = -abs(self.b.vx)  # Launch ball to the left (toward player 1)
            self.b.vy = -self.b.vy  # Reverse vertical direction for variety
        if (self.b.vx > 0):  # Check if the ball is moving to the right
            if ((self.b.x + self.b.r) + self.b.vx < (width - ww)):  # Check if the ball's next position will be within the right boundary
                self.b.x += self.b.vx  # Move the ball to the right
            else:
                # Check if the ball is outside the paddle's vertical range
                if ((self.b.y) < self.p2.y or self.b.y > self.p2.y + hh):
                    self.b.x += self.b.vx  # Allow the ball to move to the right if it's not in the vertical range of the paddle
                else:
                    # Ball is hitting the right boundary or a paddle
                    self.b.x += (width - ww) - (self.b.x + self.b.r)  # Position the ball just inside the boundary
                    self.b.vx = -self.b.vx  # Reverse the ball's horizontal direction
        else:  # The ball is moving to the left
            # Check if the ball is outside the vertical range of the left paddle or has moved past it
            if (self.b.y < self.p1.y or self.b.y > self.p1.y + hh or (self.b.x - self.b.r) + self.b.vx > ww):
                self.b.x += self.b.vx  # Move the ball to the left
            else:
                # Ball is hitting the left boundary or a paddle
                self.b.x = ww + self.b.r  # Position the ball just inside the left boundary
                self.b.vx = -self.b.vx
        if (self.b.vy > 0):
            if (self.b.y + self.b.r + self.b.vy < (height - 0)):
                self.b.y += self.b.vy
            else:
                self.b.y = (height - 0) - self.b.r
                self.b.vy = -self.b.vy
        else:
            if ((self.b.y - self.b.r) + self.b.vy > 0):
                self.b.y += self.b.vy
            else:
                self.b.y = self.b.r + 0
                self.b.vy = -self.b.vy

class PingPongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global pad_num
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'pingpong_{self.room_code}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        if self.room_group_name not in connected_players:
            connected_players[self.room_group_name] = []
        if self.room_group_name not in connected_players:
            connected_players[self.room_group_name] = []
        if len(connected_players[self.room_group_name]) >= 2:
            await self.close()
            return
        pad_num = len(connected_players[self.room_group_name])
        connected_players[self.room_group_name].append({
            'channel': self.channel_name,
            'pad_num': pad_num
        })
        await self.accept()
        print("working ", flush=True)
        await self.send(text_data=json.dumps({
            'type': 'ASSIGN_PAD_NUM',
            'pad_num': pad_num
        }))
        if len(connected_players[self.room_group_name]) == 2:
            print("In start", flush=True)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': 'game start',
                    'event': 'START',
                }
        )
        else:
            print("IN waiting", flush=True)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': 'Waiting for the second player...',
                    'event': 'wait'
                }   
        )
    async def disconnect(self, close_code):
        global pad_num
        print("in disconect with ", len(connected_players[self.room_group_name]),flush=True)

        if self.room_group_name in connected_players:
            player_left = None
            for player in connected_players[self.room_group_name]:
                if player['channel'] == self.channel_name:
                    player_left = player['pad_num']  # Retrieve the pad_num of the player who left
                    connected_players[self.room_group_name].remove(player)  # Remove the player from the list
                    break
        # I only one player remains in the room, notify them with the remaining player's pad_num
        if len(connected_players[self.room_group_name]) == 1:
            remaining_player_pad_num = connected_players[self.room_group_name][0]['pad_num']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': f'{player_left}',
                    'event': 'LEFT'
                }
            )
            await self.close()
        # If no players remain, delete the room and clean up
        if len(connected_players[self.room_group_name]) == 0:
            await self.delete_room()
            del connected_players[self.room_group_name]
    # Remov the player from the channel group
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        
    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Data is ", data.get("type"))
        if data.get('type') == 'move':
            move = data.get('move')
            padd = data.get('pad_num')
            if (padd == 1):
                match.p1.change_direction(move)
                match.p1.move()
            else:
                match.p2.change_direction(move)
                match.p2.move()
        if data.get('type') == 'start':
            asyncio.create_task(self.start_game_loop())
        if (data.get('type') == 'close'):
            print("before descon", flush=True)
            self.disconnect(1000)

    async def send_message(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'message': event['message'],
            'event': event['event']
        }))
    async def start_game_loop(self):
        global match
        match = Match(0)  
        while True:
            if match.p1.score == 5:
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': '1',
                    'event': 'END'                    

                }
            )
                break
            elif  match.p2.score == 5:
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': '0',
                    'event': 'END'                    

                }
            )
                break
            match.move()  # Update ball position
            match.p1.move()
            match.p2.move()
            ball_data = match.b.serialize_ball()
            paddle_data1 = match.p1.serialize_paddle()
            paddle_data2 = match.p2.serialize_paddle()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'ball': ball_data,
                    'paddle1': paddle_data1,
                    'paddle2': paddle_data2
                }
            )
            await asyncio.sleep(0.02)
    async def game_state(self, event):
        """Send ball position to all connected clients"""
        ball_data = event['ball']
        paddle_data1 = event['paddle1']
        paddle_data2 = event['paddle2']
        await self.send(text_data=json.dumps({
        'type': 'GAME_STATE',
        'ball': {
            'x': ball_data['x'],
            'y': ball_data['y']
        },
        'paddle1': {
            'x': paddle_data1['x'],
            'y': paddle_data1['y'],
            'score': paddle_data1['score']
        },
        'paddle2': {
            'x': paddle_data2['x'],
            'y': paddle_data2['y'],
            'score': paddle_data2['score']
        }
        })) 