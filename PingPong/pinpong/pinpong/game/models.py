from django.db import models

# Create your models here.

class Room(models.Model):
    code = models.CharField(max_length=8, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    players = models.IntegerField(default=0)
