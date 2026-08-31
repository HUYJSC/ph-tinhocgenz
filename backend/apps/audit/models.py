from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs")
    action = models.CharField("Hành động", max_length=100)
    resource = models.CharField("Tài nguyên", max_length=100)
    payload = models.JSONField("Chi tiết thay đổi", default=dict)
    ip_address = models.GenericIPAddressField("Địa chỉ IP", null=True, blank=True)
    timestamp = models.DateTimeField("Thời gian ghi nhận", auto_now_add=True)

    class Meta:
        verbose_name = "Nhật ký hệ thống"
        verbose_name_plural = "Danh sách Nhật ký hệ thống"
        ordering = ["-timestamp"]

    def __str__(self):
        actor_name = self.actor.username if self.actor else "System"
        return f"[{self.timestamp:%Y-%m-%d %H:%M:%S}] {actor_name} -> {self.action} on {self.resource}"
