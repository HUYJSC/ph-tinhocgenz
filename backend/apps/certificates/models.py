import uuid
import hashlib
from django.db import models
from django.conf import settings
from apps.courses.models import Course

class DigitalCertificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    certificate_code = models.CharField("Mã chứng chỉ", max_length=50, unique=True, db_index=True)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificates")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="issued_certificates")
    final_score = models.FloatField("Điểm tổng kết", default=0.0)
    issued_at = models.DateTimeField("Ngày cấp", auto_now_add=True)
    blockchain_hash = models.CharField("Mã băm SHA-256 xác thực", max_length=128, blank=True)
    is_revoked = models.BooleanField("Đã thu hồi", default=False)

    class Meta:
        verbose_name = "Chứng chỉ số"
        verbose_name_plural = "Danh sách Chứng chỉ số"
        ordering = ["-issued_at"]

    def save(self, *args, **kwargs):
        if not self.blockchain_hash:
            raw = f"{self.certificate_code}:{self.student.id}:{self.course.id}:{self.final_score}"
            self.blockchain_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.certificate_code} — {self.student.full_name} ({self.course.title})"
