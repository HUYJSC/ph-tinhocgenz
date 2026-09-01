from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import AcademicWarning, StudentReminder, ZaloNotificationLog
from .serializers import (
    AcademicWarningSerializer,
    StudentReminderSerializer,
    ZaloNotificationLogSerializer
)
from apps.accounts.permissions import IsTeacherOrAdmin, IsAdmin

class AcademicWarningViewSet(viewsets.ModelViewSet):
    """
    Quản lý cảnh báo học vụ:
    - Giáo viên / Admin: Xem danh sách, cập nhật xử lý.
    """
    queryset = AcademicWarning.objects.filter(is_deleted=False).select_related("student")
    serializer_class = AcademicWarningSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        risk_level = self.request.query_params.get("risk_level")
        if risk_level:
            qs = qs.filter(risk_level=risk_level)
        is_resolved = self.request.query_params.get("is_resolved")
        if is_resolved is not None:
            qs = qs.filter(is_resolved=is_resolved.lower() == "true")
        return qs

    def perform_destroy(self, instance):
        instance.soft_delete()

class StudentReminderViewSet(viewsets.ModelViewSet):
    """
    Cài đặt chu kỳ nhắc nhở học tập:
    - Học viên: Xem và chỉnh sửa cài đặt của chính mình.
    - Cán bộ/Admin: Toàn quyền tra cứu và cập nhật.
    """
    queryset = StudentReminder.objects.filter(is_deleted=False).select_related("student")
    serializer_class = StudentReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role in ["admin", "academic", "teacher"]:
            student_id = self.request.query_params.get("student_id")
            if student_id:
                return qs.filter(student_id=student_id)
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def perform_destroy(self, instance):
        instance.soft_delete()

class ZaloNotificationLogViewSet(viewsets.ModelViewSet):
    """
    Quản lý lịch sử phát tin Zalo ZNS sinh bởi AI:
    - Phân tách theo độ tuổi: < 25 tuổi định tuyến gửi Phụ huynh, >= 25 tuổi gửi Học viên tự chủ.
    """
    queryset = ZaloNotificationLog.objects.filter(is_deleted=False).select_related("student")
    serializer_class = ZaloNotificationLogSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        cycle = self.request.query_params.get("cycle")
        if cycle:
            qs = qs.filter(cycle=cycle)
        recipient_type = self.request.query_params.get("recipient_type")
        if recipient_type:
            qs = qs.filter(recipient_type=recipient_type)
        return qs

    def perform_destroy(self, instance):
        instance.soft_delete()
