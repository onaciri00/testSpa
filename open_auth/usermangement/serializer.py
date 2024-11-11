from rest_framework     import serializers
from oauth.models       import User_info
from .models            import MatchHistoric
from .models            import RequestFriend
from django.contrib.auth.hashers import make_password


class   MatchHistoricSerialzer(serializers.ModelSerializer):
    class Meta:
        model = MatchHistoric
        fields=[
            'id',
            'user',
            'opponent',
            'result',
            'create_at',
            'level'
        ]

class   ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_info
        fields = [
            'id',
            'username',
            'fullname',
            'firstname',
            'lastname',
            'email',
            'imageProfile',
            'level'
        ]

class   UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_info
        fields = [
            'id',
            'username',
            'fullname',
            'firstname',
            'lastname',
            'email',
            'imageProfile',
            'level'
        ]

class       RequestFriendSerializer(serializers.ModelSerializer):
    from_user   = UserInfoSerializer()  # or use User_infoSerializer if needed
    to_user     = UserInfoSerializer()
    class Meta:
        model = RequestFriend
        fields = [
            'id',
            'from_user',
            'to_user',
            'accepted', 
            'timestamp'
        ]

class UpdateUserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User_info
        fields = [
            'id',
            'firstname',
            'lastname',
            'email',
            'imageProfile'
        ]
    
    def validate(self, data):
        if 'confirm_password' in data and 'password' in data:
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError("Passwords do not match.")
        return data

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
            validated_data.pop('confirm_password', None)
        return super().update(instance, validated_data)
    