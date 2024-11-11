from    django.urls             import path
from    usermangement           import views
from    usermangement           import xo_historic

urlpatterns=[
    path('update/', views.update_user),
    path('Profile/', views.profile),
    path('list/', views.users_list),
    path('ChangePass/', views.ChangePassword),# update password and also username
    path('accepte_request/<int:receiver_id>/', views.accepte_request), # a dynamic segment <int:receiver_id>
    path('send_friend/<int:receiver_id>/', views.send_friend_request), # a dynamic segment <int:receiver_id>
    path('reject_request/<int:receiver_id>/', views.reject_request), # a dynamic segment <int:receiver_id>
    path('get_requests/', views.get_request), # user/get_requests/
    path('get_user_friends/', views.get_user_friends), # user/get_user_friends/
    path('get_user_info/', views.get_user),
    path('unfriend/<int:received_id>/', views.unfriend),
    path('cancel_friend_request/', views.cancel_friend_req),
    path('store_match/', xo_historic.store_match),
    path('get_match_history/', xo_historic.get_match_history),
    path('get_curr_user/', xo_historic.get_curr_user)
]
