from django.urls import path
from .views import (
    UserRegistrationView,
    UserAuthView,
    UserDetailView,
    UserChangeThemeView,
    UserCheckRecaptchaTokenView,
    UserView,
    UserSubscribeView,
    UserUnsubcribeView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register", UserRegistrationView.as_view(), name="register-user"),
    path("auth", UserAuthView.as_view(), name="authorization-user"),
    path("users/", UserView.as_view(), name="users"),
    path("users/subscribe", UserSubscribeView.as_view(), name="subscribe-to-user"),
    path("users/unsubscribe", UserUnsubcribeView.as_view(), name="unsubscribe-to-user"),
    path("user/", UserDetailView.as_view(), name="get-user-theme-firstName"),
    path("user/changeTheme", UserChangeThemeView.as_view(), name="change-userTheme"),
    path(
        "checkCaptchaToken",
        UserCheckRecaptchaTokenView.as_view(),
        name="check-recaptchaToken",
    ),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
