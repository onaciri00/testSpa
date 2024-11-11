from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from django.contrib import messages
import requests
from django.middleware.csrf             import get_token
from  django.shortcuts                  import  get_object_or_404
from rest_framework.decorators          import api_view, permission_classes
from rest_framework.permissions         import AllowAny
from  rest_framework.authtoken.models   import Token
from  rest_framework                    import status
from .serializers                       import CustmerSerializer, RegisterSerializer
from .forms                             import CustomerForm
from .models                            import User_info
from django.contrib.auth.forms          import UserCreationForm, AuthenticationForm
from django.utils.decorators            import method_decorator
from rest_framework.response            import Response
from rest_framework                     import status
from django.core.files.base import ContentFile
from django.conf import settings
from django.core.files import File
import os
from channels.layers     import get_channel_layer
from asgiref.sync        import async_to_sync

client_id       = "u-s4t2ud-fa7692872a0200db78dfe687567cc55dd2a444234c7720f33c53e0a4286a7301"
client_secret   = "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"
redirect_url    = "https://localhost/"
authorization_url = "https://api.intra.42.fr/oauth/authorize"
token_url = "https://api.intra.42.fr/oauth/token"
grant_type = "authorization_code"

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def     register_vu(request):
    print("\033[1;32m you're in the register function \n")
    if request.method == 'POST':
        # form = CustmerSerializer(data=request.data) #request.data = post data from client
        form = CustomerForm(data=request.data) #request.data = post data from client

        print(f"Form Data: {request.data}")
        if form.is_valid():
            print("\033[1;38m This user is valid \n")
            user = form.save()
            if not user.imageProfile:  # Assuming 'imageProfile' is the field name for profile images
                # Path to the default avatar
                default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'profile_image/a2.jpg')
                # Open the default avatar and assign it as the profile image
                with open(default_avatar_path, 'rb') as avatar_file:
                    user.imageProfile.save('default_avatar.jpg', File(avatar_file))
            user_token, created = Token.objects.get_or_create(user=user)
            seria = RegisterSerializer(instance=user)
            print(f"\033[1;38m This is the user token: {user_token}")
            print(f"\033[1;38m This is the user data ", seria.data)
            return JsonResponse({'status': 'success', 'data':seria.data}, status=200)
        else:
            errors = form.errors.as_json()
            print("\033[1;39m This user failed to sign up \n")  
            print(f"Errors: {errors}")  # Add this line   
            return JsonResponse({'status': 'faild', 'error': form.errors}, status=400)
    return JsonResponse({'status': False, "error": form.errors}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def     logout_vu(request):
    print ("------------------------------------------------------------\n")

    user = request.user
    
    user.online_status = False
    user.save()
    
    frends = user.friends.all()  
    channel_layer = get_channel_layer()
    for friend_of_user in frends:
        # Send a message to the friend's WebSocket channel
        async_to_sync(channel_layer.group_send)(
            f'user_{friend_of_user.id}',
            {
                'type': 'notify_user_status',
                'data':
                {
                    'id': user.id,
                    'username':user.username,
                    'online_status': False
                }
            }
        )
    if request.method == 'POST':
        logout(request)
        return (JsonResponse({'status':'success'}))
    else :
        return (JsonResponse({'status':'faild'}))

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_vu(request):
    print("\033[1;35m This login_vu  \n")
    print(f"Form Data: {request.data}")

    username = request.data.get('username')
    password = request.data.get('password')

    # Authenticate user
    user = authenticate(username=username, password=password)
    if user is None:
        print("\033[1;46m this User Is Not Found \n")
        return Response({"status": False, "error": "Invalid credentials"}, status=status.HTTP_404_NOT_FOUND)
    print("\033[1;46m this User Is Found \n")
    print("user == ", user)

    # Log the user in
    login(request, user)
    # from now django will know that this user who make a request and will be update in case other user login 
    # Example: Print session data
    print(f"Session Data: {request.session.items()}")

    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    # Serialize user data
    serialize_user = CustmerSerializer(instance=user)
    print('serializer_data = ', serialize_user.data)
    return Response({"token": token.key, "data": serialize_user.data, "status":"success"})

from django.contrib.sessions.models import Session

def     oauth_authorize(request): 
    print("\033[1;32m oauth_authorize \n")

    full_authoriztion_url = authorization_url + \
        f'?client_id={client_id}&redirect_uri={redirect_url}&response_type=code'
    return JsonResponse({'status' : 'success','full_authoriztion_url' : full_authoriztion_url})

# decorator ensures that the response will include a CSRF cookie if it wasn't already set.
# in the firat time will create a cookie csrf
# @csrf_exempt
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    print ("tokeeen -------> ", token)
    return JsonResponse({'csrfToken': token})

import json, os
# @csrf_exempt
# @api_view(['POST', 'GET'])
# @permission_classes([AllowAny])

def callback(request):
    print ('============================ callback is called ============================\n')
    # print("Request Body: ", request.body)
    
    data = json.loads(request.body)
    code = data.get('code')

    print("\033[1;39m ---> code  =  ", code, "\n")
    if not code:
        return JsonResponse({'status': 'error', 'message': 'No code provided'}, status=400)

    # Exchange the code for an access token
    # print("\033[1;35m ---> token **--** ", token_url, "\n")
    # print("\033[1;35m ---> code  **--** ", code, "\n")
    # print("\033[1;35m --->  redirect_url **--** ", redirect_url, "\n")
    # print("\033[1;35m ---> client_id  **--** ", client_id, "\n")
    # print("\033[1;35m ---> client_secret  **--** ", client_secret, "\n")
    necessary_info = {
        'grant_type': grant_type,
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_url
    }
    response = requests.post(token_url, data=necessary_info)
    # print("Response Content: ", response.content)

    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access_token')
        if access_token:
            user_data   = get_user_info_api(access_token)
            # print ('user_data : ' , user_data)
            username    = user_data.get('login', 'Guest')
            fullname    = user_data.get('displayname', '')
            firstname = user_data.get('first_name', '')
            lastname = user_data.get('last_name', '')
            email = user_data.get('email', '')
            image_url   = user_data.get('image', {}).get('link', '')
            print ('username : ', username) 
            print ('image_url : ', image_url) 
            
            # Save or update user info
            user, created       = User_info.objects.get_or_create(username=username)
            user.fullname       = fullname
            user.username       = username
            user.firstname      = firstname
            user.lastname       = lastname
            user.email          = email
            user.access_token   = access_token

            print ("\033[1;35m -----------------------------------------------------------")
            print ('image_url : ', image_url)
            if image_url:
                image_name = f'{username}.jpg'
                if not user.imageProfile or not os.path.exists(user.imageProfile.path):
                    # Image doesn't exist locally, download and save it
                    print ('< ---------------- >image_name : ', image_name)
                    print ('< ---------------- >image_url  : ', image_url)
                    imageResponse = requests.get(image_url)
                    print ('< ---------------- >status_code  : ',  imageResponse.status_code)
                    if imageResponse.status_code == 200:
                        user.imageProfile.save(image_name, ContentFile(imageResponse.content), save=True)
                    else:
                        print('Image already exists, not downloading again.')
                    
            print ("\033[1;35m -----------------------------------------------------------")
            user.save()
            login(request, user)
            # print("\033[1;39m ---> user = ", user) 
            # Return user data as JSON
            seria = CustmerSerializer(instance=user)
            return JsonResponse({'status': 'success','data': seria.data})
        else:
            return JsonResponse({'status': 'error', 'message': 'Empty access token'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Failed to exchange token'}, status=response.status_code)

def     get_user_info_api(access_token):
   user_endpoint = 'https://api.intra.42.fr/v2/me'
   headers= {
      'Authorization' : f'Bearer {access_token}'
   }
   response = requests.get(user_endpoint, headers=headers)
   if response.status_code == 200:
        user_data = response.json()
        return user_data
   else :
        return None

"""
If the user is redirected to your callback URL with the following URL:

http://127.0.0.1:8000/oauth/callback/?code=1234
1- request.GET would be {'code': '1234'}.
2- request.GET.get('code') would return '1234'.
3- code would be assigned the value '1234'

If the URL does not contain a code parameter:
http://127.0.0.1:8000/oauth/callback/

1- request.GET would be {} (an empty dictionary).
2- request.GET.get('code') would return None.
3- code would be assigned the value None.
""" 

# Create your views here.
# ????????????????? important reademe please .
# ask django to give you all the method that can i use as back-end ?
# ask can i need datapase in this app (oauth) why you don't use it here.
# you must to create a tldr file that you show how to make this .
# then must add some design myb9ach nachf 
# then start user management.
