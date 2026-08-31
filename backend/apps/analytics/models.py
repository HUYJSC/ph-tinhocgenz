import uuid
from django.db import models
from django.conf import settings

class AcademicWarning(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = "LOW", "Thấp"
        MEDIUM = "MEDIUM", "Trung bình"
        HIGH = "HIGH", "Cao"
        CRITICAL = "CRITICAL", "Đặc biệt nguy hiểm"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academic_warnings")
    risk_level = models.CharField("Mức độ nguy cơ", max_length=20, choices=RiskLevel.choices, default=RiskLevel.MEDIUM)
    reasons = models.JSONField("Lý do cảnh báo", default=list)
    is_resolved = models.BooleanField("Đã xử lý", default=False)
    resolution_notes = models.TextField("Ghi chú xử lý", blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cảnh báo học vụ"
        verbose_name_plural = "Danh sách Cảnh báo học vụ"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.risk_level}] {self.student.full_name} ({self.student.username})"


class ZaloNotificationLog(models.Model):
    class RecipientType(models.TextChoices):
        PARENT = "parent", "Phụ huynh (< 25 tuổi)"
        STUDENT = "student", "Học viên (≥ 25 tuổi - Tự chủ)"

    class Cycle(models.TextChoices):
        DAILY = "daily", "Hằng ngày"
        WEEKLY = "weekly", "Hằng tuần"
        MONTHLY = "monthly", "Hằng tháng"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="zalo_notifications")
    recipient_type = models.CharField("Đối tượng nhận", max_length=20, choices=RecipientType.choices)
    recipient_name = models.CharField("Họ tên người nhận", max_length=150)
    recipient_phone = models.CharField("Số điện thoại Zalo", max_length=30)
    cycle = models.CharField("Chu kỳ", max_length=20, choices=Cycle.choices, default=Cycle.WEEKLY)
    ai_generated_message = models.TextField("Tin nhắn sinh bởi AI")
    status = models.CharField("Trạng thái", max_length=20, default="sent")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Nhật ký Zalo AI"
        verbose_name_plural = "Nhật ký Gửi tin Zalo AI"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.cycle}] {self.recipient_name} ({self.recipient_phone}) - {self.recipient_type}"
