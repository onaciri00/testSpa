from django.contrib import admin

# Register your models here.
from .models import RequestFriend
from .models import MatchHistoric

admin.site.register(RequestFriend)
admin.site.register(MatchHistoric)
