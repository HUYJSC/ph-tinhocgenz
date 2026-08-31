from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("actor", "action", "resource", "ip_address", "timestamp")
    list_filter = ("action", "timestamp")
    search_fields = ("actor__username", "resource", "action")
    readonly_fields = ("actor", "action", "resource", "payload", "ip_address", "timestamp")
