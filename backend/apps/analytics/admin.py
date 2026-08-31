from django.contrib import admin
from .models import AcademicWarning

@admin.register(AcademicWarning)
class AcademicWarningAdmin(admin.ModelAdmin):
    list_display = ("student", "risk_level", "is_resolved", "created_at", "updated_at")
    list_filter = ("risk_level", "is_resolved")
    search_fields = ("student__username", "student__full_name", "resolution_notes")
