from rest_framework import viewsets, mixins
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsAdmin

def log_audit_event(actor=None, action="", resource="", payload=None, ip_address=None):
    """Tiện ích ghi nhật ký an ninh và kiểm toán hệ thống."""
    return AuditLog.objects.create(
        actor=actor,
        action=action,
        resource=resource,
        payload=payload or {},
        ip_address=ip_address
    )

class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    Tra cứu nhật ký kiểm toán hệ thống (Chỉ dành cho Quản trị viên).
    - Tối ưu select_related("actor").
    """
    queryset = AuditLog.objects.all().select_related("actor")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get("action")
        if action:
            qs = qs.filter(action=action)
        resource = self.request.query_params.get("resource")
        if resource:
            qs = qs.filter(resource=resource)
        return qs
