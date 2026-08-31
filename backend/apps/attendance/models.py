import uuid
from django.db import models
from django.conf import settings
from apps.courses.models import Course

class AttendanceSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="attendance_sessions")
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="hosted_sessions")
    class_code = models.CharField("Mã lớp học", max_length=50, db_index=True)
    session_title = models.CharField("Chủ đề buổi học", max_length=255)
    session_number = models.IntegerField("Buổi số", default=1)
    session_date = models.DateField("Ngày học")
    is_open = models.BooleanField("Đang mở điểm danh", default=True)
    pin_code = models.CharField("Mã PIN 4 số", max_length=10, default="1234")
    qr_token = models.CharField("Token QR động", max_length=100, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ca điểm danh"
        verbose_name_plural = "Danh sách Ca điểm danh"
        ordering = ["-session_date"]

    def __str__(self):
        return f"[{self.class_code}] Buổi {self.session_number}: {self.session_title}"

class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        PRESENT = "present", "Có mặt"
        ABSENT = "absent", "Vắng mặt"
        LATE = "late", "Đi muộn"
        EXCUSED = "excused", "Có phép"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name="records")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_records")
    status = models.CharField("Trạng thái", max_length=20, choices=Status.choices, default=Status.PRESENT)
    checkin_time = models.DateTimeField("Thời gian check-in", auto_now_add=True)
    verified_location = models.CharField("Tọa độ GPS", max_length=100, blank=True, default="")
    note = models.TextField("Ghi chú", blank=True, default="")

    class Meta:
        verbose_name = "Bản ghi điểm danh"
        verbose_name_plural = "Danh sách bản ghi điểm danh"
        unique_together = ("session", "student")

    def __str__(self):
        return f"{self.student.username} - {self.session.session_title} ({self.get_status_display()})"
