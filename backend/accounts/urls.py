from django.urls import path

from . import views

urlpatterns = [
    path("login", views.user_login, name="login"),
    path("register", views.register_account, name="register"),
    path("logout", views.logout_user, name="logout"),
    path("me", views.current_user_check, name="current_user"),
]