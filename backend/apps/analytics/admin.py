from django.contrib import admin
from .models import AcademicWarning, ZaloNotificationLog

@admin.register(AcademicWarning)
class AcademicWarningAdmin(admin.ModelAdmin):
    list_display = ("student", "risk_level", "is_resolved", "created_at", "updated_at")
    list_filter = ("risk_level", "is_resolved")
    search_fields = ("student__username", "student__full_name", "resolution_notes")

@admin.register(ZaloNotificationLog)
class ZaloNotificationLogAdmin(admin.ModelAdmin):
    list_display = ("student", "recipient_type", "recipient_name", "recipient_phone", "cycle", "status", "created_at")
    list_filter = ("recipient_type", "cycle", "status")
    search_fields = ("student__username", "recipient_name", "recipient_phone", "ai_generated_message")

