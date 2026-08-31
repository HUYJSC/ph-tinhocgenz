from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "total_sessions", "target_badge", "order_index", "is_published")
    list_filter = ("is_published", "target_badge")
    search_fields = ("code", "title", "short_desc")
    ordering = ("order_index", "code")
