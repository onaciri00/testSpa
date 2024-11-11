"""
ASGI config for open_auth project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from usermangement.routing import websocket_urlpatterns
from usermangement.consumers import FriendRequestConsumer  # Update to your app name


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'open_auth.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns  # Import your WebSocket URL patterns
        )
    ),
})


# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from usermangement.routing import websocket_urlpatterns
# from usermangement.consumers import FriendRequestConsumer  # Update to your app name


# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'open_auth.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             websocket_urlpatterns  # Import your WebSocket URL patterns
#         )
#     ),
# })

# def login_vu(request):
#     print("\033[1;35m This login_vu  \n")
#     print(f"Form Data: {request.data}")

#     username = request.data.get('username')
#     password = request.data.get('password')

#     # Authenticate user
#     user = authenticate(username=username, password=password)
#     if user is None:
#         print("\033[1;46m this User Is Not Found \n")
#         return Response({"status": False, "error": "Invalid credentials"}, status=status.HTTP_404_NOT_FOUND)
#     print("\033[1;46m this User Is Found \n")
#     print("user == ", user)

#     # Log the user in
#     login(request, user) # from now django will know that this user who make a request and will be update in case other user login 

#     # Example: Print session data
#     print(f"Session Data: {request.session.items()}")

#     # Get or create token
#     token, created = Token.objects.get_or_create(user=user)
#     # Serialize user data
#     serialize_user = CustmerSerializer(instance=user)
#     print('serializer_data = ', serialize_user.data)
#     return Response({"token": token.key, "data": serialize_user.data, "status":"success"})

# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]