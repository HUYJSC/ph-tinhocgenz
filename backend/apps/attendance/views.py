from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import AttendanceSession, AttendanceRecord
from .serializers import AttendanceSessionSerializer, AttendanceRecordSerializer
from apps.accounts.permissions import IsTeacherOrAdmin

class AttendanceSessionListView(generics.ListCreateAPIView):
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = AttendanceSession.objects.filter(is_deleted=False).select_related("course", "teacher")
        if user.role in ["admin", "academic"]:
            return qs
        elif user.role == "teacher":
            return qs.filter(teacher=user)
        return qs.filter(class_code=user.class_code, is_open=True)

class CheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = AttendanceSession.objects.get(id=session_id, is_open=True, is_deleted=False)
        except AttendanceSession.DoesNotExist:
            return Response({"error": "Ca điểm danh không tồn tại hoặc đã kết thúc."}, status=status.HTTP_404_NOT_FOUND)

        pin_code = request.data.get("pin_code", "").strip()
        if session.pin_code and pin_code != session.pin_code:
            return Response({"error": "Mã PIN điểm danh không chính xác."}, status=status.HTTP_400_BAD_REQUEST)

        record, created = AttendanceRecord.objects.get_or_create(
            session=session,
            student=request.user,
            defaults={
                "status": AttendanceRecord.Status.PRESENT,
                "verified_location": request.data.get("location", "")
            }
        )

        return Response({
            "message": "Điểm danh thành công!",
            "session_title": session.session_title,
            "status": record.status
        }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

class AttendanceRecordListView(generics.ListAPIView):
    """Giảng viên / Admin xem danh sách điểm danh của một ca học."""
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        session_id = self.kwargs.get("session_id")
        return AttendanceRecord.objects.filter(
            session_id=session_id,
            is_deleted=False
        ).select_related("student", "session")
