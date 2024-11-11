from django.urls    import path
from .              import views

urlpatterns=[
    path('oauth/', views.oauth_authorize, name='oauth_authorize'), #api endponit 
    path('oauth/callback/', views.callback,  name='oauth_callback'),
    path('get_csrf_token/', views.get_csrf_token, name='get_csrf_token'),
    path('register/', views.register_vu,  name='register'),
    path('login/', views.login_vu,  name='login'),
    path('logout/', views.logout_vu,  name='logout')
]