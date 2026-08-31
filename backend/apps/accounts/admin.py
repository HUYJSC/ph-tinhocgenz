from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "full_name", "role", "student_code", "teacher_code", "class_code", "program_track", "is_active", "date_joined")
    list_filter = ("role", "is_active", "program_track", "class_code")
    search_fields = ("username", "full_name", "email", "phone", "student_code", "teacher_code")
    ordering = ("-date_joined",)
    
    fieldsets = (
        ("Thông tin tài khoản", {"fields": ("username", "password", "role")}),
        ("Thông tin cá nhân", {"fields": ("full_name", "email", "phone")}),
        ("Phân loại học vụ & Lớp học", {"fields": ("student_code", "teacher_code", "class_code", "school_or_class", "program_track")}),
        ("Quyền & Trạng thái bảo mật", {"fields": ("is_active", "is_staff", "is_superuser", "must_change_password")}),
        ("Thời gian", {"fields": ("last_login", "date_joined")}),
    )
