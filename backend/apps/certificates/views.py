from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import DigitalCertificate
from .serializers import DigitalCertificateSerializer

class PublicCertificateVerifyView(generics.RetrieveAPIView):
    """Tra cứu công khai chứng chỉ theo mã certificate_code"""
    queryset = DigitalCertificate.objects.filter(is_revoked=False)
    serializer_class = DigitalCertificateSerializer
    permission_classes = [AllowAny]
    lookup_field = "certificate_code"

class MyCertificatesView(generics.ListAPIView):
    serializer_class = DigitalCertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DigitalCertificate.objects.filter(student=self.request.user, is_revoked=False)
