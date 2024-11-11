from rest_framework import serializers
from .models import User_info

class       CustmerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    email     = serializers.EmailField(required=True)
    fullname = serializers.CharField(required=True)
    class Meta :
        model = User_info
        fields = [
            'id',
            'fullname',
            'imageProfile',
            'username',
            'firstname',
            'lastname',
            'email',
            'online_status'
        ]

class       RegisterSerializer(serializers.ModelSerializer):
    class Meta :
        model = User_info
        fields = [
            'fullname',
            'username',
            'firstname',
            'lastname',
            'imageProfile',
            'email',
        ]
