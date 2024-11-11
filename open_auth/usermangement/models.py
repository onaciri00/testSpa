from django.db import models
from oauth.models import User_info
# Create your models here.

# class Profie(models.Model):
#     pass

class           RequestFriend(models.Model):
    from_user   = models.ForeignKey(User_info, related_name="request_sent", on_delete=models.CASCADE)
    to_user     = models.ForeignKey(User_info, related_name="request_received", on_delete=models.CASCADE)
    accepted    = models.BooleanField ( default  = False)
    timestamp   = models.DateTimeField(auto_now_add=True)

class           MatchHistoric(models.Model):
    user        = models.ForeignKey(User_info, related_name="user", on_delete=models.CASCADE)
    opponent    = models.ForeignKey(User_info, related_name="opponent", on_delete=models.CASCADE)
    result      = models.CharField(max_length=10)
    create_at   = models.CharField(max_length=20)
    level       = models.IntegerField(default=0) 
    # models.DateTimeField(auto_now_add = True)

# related_name allows you to query the related objects in reverse:

# You can find all friend requests sent by John (ID 1) using john.sent_requests.all().
# You can find all friend requests received by John using john.received_requests.all().
# on_delete=models.CASCADE ensures that if John (ID 1) were deleted, all his sent and 
# received friend requests would also be removed from the database, maintaining data integrity.