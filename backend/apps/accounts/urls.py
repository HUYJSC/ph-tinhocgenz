from django.urls import path
from .views import LoginView, LogoutView, CurrentUserView, ChangePasswordView

urlpatterns = [
    path("login/", LoginView.as_view(), name="accounts-login"),
    path("logout/", LogoutView.as_view(), name="accounts-logout"),
    path("me/", CurrentUserView.as_view(), name="accounts-me"),
    path("change-password/", ChangePasswordView.as_view(), name="accounts-change-password"),
]
