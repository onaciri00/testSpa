# from django.db import models

# Create your models here.

#-> Summary of Concepts Used
#-> PostgreSQL Installation: Installing PostgreSQL and setting up a new user and database.
#-> Python Database Adapter: Installing psycopg2-binary to allow Django to communicate with PostgreSQL.
#-> Django Settings: Configuring Django to use PostgreSQL as its database backend.
#-> Django Migrations: Applying database migrations to set up the necessary tables in PostgreSQL.

from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User_info(AbstractUser):
    access_token = models.CharField(max_length=255, null=True, blank=True)
    intra_id  = models.CharField(max_length=255, null=True, blank=True)
    imageProfile = models.ImageField(upload_to='profile_image/', null=True, blank=True)
    username  = models.CharField(max_length=255, null=True, blank=True, unique=True)
    firstname = models.CharField(max_length=255, null=True, blank=True, unique=True)
    lastname  = models.CharField(max_length=255, null=True, blank=True, unique=True)
    fullname  = models.CharField(max_length=255, null=True, blank=True)
    email     = models.EmailField(unique=True, null=True, blank=True)
    friends   = models.ManyToManyField('self', blank=True)
    online_status = models.BooleanField(default=False)   
    level    = models.IntegerField(default=0)
    # understand this #
 
    groups = models.ManyToManyField(
        Group,
        related_name="oauth_user_set",  # Changed related_name to avoid conflict
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="oauth_user_permissions_set",  # Changed related_name to avoid conflict
        blank=True
    )

    def __str__(self):
        return self.username if self.username else "Unnamed User"
