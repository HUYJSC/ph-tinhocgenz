from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

admin.site.site_header = "PH DIGITAL EDUCATION — CỔNG QUẢN TRỊ HỆ THỐNG"
admin.site.site_title = "PH Digital Education Admin"
admin.site.index_title = "Trung Tâm Điều Hành & Quản Trị Cán Bộ, Giảng Viên & Học Viên"

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for Kubernetes / Cloud / Docker."""
    return Response({
        "status": "healthy",
        "service": "PH Digital Education Backend",
        "version": "1.0.0",
        "timestamp": "2026-08-31T07:18:00Z"
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/v1/accounts/", include("apps.accounts.urls")),
    path("api/v1/courses/", include("apps.courses.urls")),
    path("api/v1/assessments/", include("apps.assessments.urls")),
    path("api/v1/attendance/", include("apps.attendance.urls")),
    path("api/v1/certificates/", include("apps.certificates.urls")),
]
