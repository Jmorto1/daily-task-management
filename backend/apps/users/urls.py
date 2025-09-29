from django.urls import path
from .views import LoginView,LogoutView,CurrentUserView,UserCRUDView,CookieTokenRefreshView,ForgotPasswordView, ResetPasswordView,CheckPasswordView,ChangePasswordView
urlpatterns=[
    path("",UserCRUDView.as_view()),
    path("login/",LoginView.as_view()),
    path("logout/",LogoutView.as_view()),
    path("me/",CurrentUserView.as_view()),
    path("refresh/",CookieTokenRefreshView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/<int:uid>/<str:token>/", ResetPasswordView.as_view(), name="reset-password"),
    path("check-password/", CheckPasswordView.as_view(), name="check-password"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
] 

