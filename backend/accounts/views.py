from django.shortcuts import redirect, render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

import json

from .models import User
# User = get_user_model()

# def user_login(request):
#     return redirect()

# @csrf_exempt
def user_login(request):

    if request.method == "POST":

        # data = json.loads(request.body)

        # username = data.get("username")
        # password = data.get("password")

        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:

            if user.status == "blocked":
                error = "Account blocked!"
                return render(request, "login.html", error, status=403)
                # return JsonResponse({
                #     "error": "Account blocked!"
                # }, status=403)

            login(request, user)
            
            # user_id = user.id
            # username = user.username
            # role = user.role
            user = {
                "id": user.id,
                "username": user.username,
                "role": user.role,
            }
            
            return redirect("index")
            
            # return render(request, "index.html", user, status=200)
            # return JsonResponse({
            #     "message": "Login successful!",
            #     "user": {
            #         "id": user_id,
            #         "username": username,
            #         "role": role,
            #     }
            # }, status=200)
            
        error= "Invalid username or password!"            
        return render(request, "login.html", error
        , status=401)
    
        # return JsonResponse({
        #     "error": "Invalid username or password!"
        # }, status=401)
    # error= "Method not allowed!"            
    # return render(request, "login.html", error
    # , status=400)
    return render(request, "login.html")
    # return JsonResponse({"error": "Method not allowed!"}, status=400)
    
    
@csrf_exempt
def register_account(request):

    if request.method == "POST":

        gotten_data = json.loads(request.body)

        username = gotten_data.get("username")
        password = gotten_data.get("password")
        email = gotten_data.get("email")
        phone_number = gotten_data.get("phone_number")

        if User.objects.filter(username=username).exists():
            return JsonResponse({
                "error": "Username already exists!"
            }, status=400)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            status="on_hold",
            phone_number=phone_number
        )

        return JsonResponse({
            "message": "User created successfully, but needs admin approval!"
        }, status=201)
    
    return JsonResponse({"error": "Method not allowed!"}, status=400)

# @csrf_exempt
def logout_user(request):

    logout(request)

    # return JsonResponse({
    #     "message": "Logged out successfully"
    # })
    return redirect("login")
    
def current_user_check(request):

    if not request.user.is_authenticated:
        return JsonResponse({
            "authenticated": False
        })

    return JsonResponse({
        "authenticated": True,
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "role": request.user.role,
        }
    })