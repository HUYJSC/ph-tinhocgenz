from django.urls import path
from .views import PublicCertificateVerifyView, MyCertificatesView

urlpatterns = [
    path("verify/<str:certificate_code>/", PublicCertificateVerifyView.as_view(), name="certificate-verify"),
    path("my-certificates/", MyCertificatesView.as_view(), name="my-certificates"),
]
