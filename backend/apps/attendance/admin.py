from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord

@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ("class_code", "session_number", "session_title", "teacher", "session_date", "pin_code", "is_open")
    list_filter = ("is_open", "session_date", "course")
    search_fields = ("class_code", "session_title", "teacher__full_name")

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("session", "student", "status", "checkin_time", "verified_location")
    list_filter = ("status", "session__class_code")
    search_fields = ("student__username", "student__full_name", "session__session_title")
