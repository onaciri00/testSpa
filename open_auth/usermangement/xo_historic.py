from oauth.models               import User_info
from .models                    import MatchHistoric
from .serializer                 import  MatchHistoricSerialzer, UserInfoSerializer
from    django.http             import JsonResponse
from rest_framework.decorators  import api_view
from django.contrib.auth import authenticate, login, logout

@api_view(['POST'])
def         store_match(request):
    user            = request.user
    
    if not user.is_authenticated:
        return JsonResponse({'status' : '400', 'data' : 'user is not authenticated'})

    user_db = User_info.objects.get(id=user.id)

    
    match_serialize =  MatchHistoricSerialzer(data=request.data)
    print ('user ------- >> : ', user, flush=True) 
    
    user_db.level = request.data.get('level')
    print("The level is ", request.data.get('level'), flush=True)
    print("The result is ", request.data.get('result'), flush=True)
    print("The opponent is ", request.data.get('opponent'), flush=True)
    user_db.save()
    print("use is save", flush=True)
    print ("error ", match_serialize.is_valid())
    if match_serialize.is_valid():
        print("the match is stored", flush=True)
        match_serialize.save()
        return JsonResponse({'data':match_serialize.data, 'status' : '200'})
    print("error in saving")
    return JsonResponse({'data':match_serialize.data, 'status' : '400'})

@api_view(['GET'])
def get_match_history(request):
    user = request.user  # Get the authenticated user
    if not user.is_authenticated:
        return JsonResponse({'status' : '400', 'data' : 'user is not authenticated'})
    match_history = MatchHistoric.objects.filter(user=user)  # Retrieve matches for the authenticated user

    response_data = []
    for match in match_history:
        match_data = {
            "id": match.id,
            "user": {
                "id": match.user.id,
                "username": match.user.username,
                "imageProfile": match.user.imageProfile.url
            },
            "opponent": {
                "id": match.opponent.id,
                "username": match.opponent.username,
                "imageProfile": match.opponent.imageProfile.url
            },
            "result": match.result,
        }
        response_data.append(match_data)

    return JsonResponse(response_data, safe=False)

@api_view(['GET'])
def         get_curr_user(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse ({'status' : '400', 'data' : 'user is not authenticated'})
    user = User_info.objects.get(id = user.id)
    print ('--------------------------------\n')
    print ('--------- ', user, ' -----------\n')
    print ('--------------------------------\n')
    serialize_user = UserInfoSerializer(user)
    return JsonResponse({'status': '200', 'data' : serialize_user.data})











