from django.urls import path
from .views import LoginView,LogoutView,CurrentUserView,UserCRUDView,CookieTokenRefreshView
urlpatterns=[
    path("",UserCRUDView.as_view()),
    path("login/",LoginView.as_view()),
    path("logout/",LogoutView.as_view()),
    path("me/",CurrentUserView.as_view()),
    path("refresh/",CookieTokenRefreshView.as_view())
] 