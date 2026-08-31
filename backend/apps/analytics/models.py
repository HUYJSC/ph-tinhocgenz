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
