from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView,
    RefreshTokenView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserViewSet
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("login/", LoginView.as_view(), name="accounts-login"),
    path("token/refresh/", RefreshTokenView.as_view(), name="accounts-token-refresh"),
    path("logout/", LogoutView.as_view(), name="accounts-logout"),
    path("me/", CurrentUserView.as_view(), name="accounts-me"),
    path("change-password/", ChangePasswordView.as_view(), name="accounts-change-password"),
    path("password-reset-request/", PasswordResetRequestView.as_view(), name="accounts-password-reset-request"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="accounts-password-reset-confirm"),
    path("", include(router.urls)),
]
