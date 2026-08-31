from django.contrib import admin
from .models import Assignment, Submission

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "teacher", "due_date", "is_open", "created_at")
    list_filter = ("is_open", "course")
    search_fields = ("title", "description", "teacher__full_name")

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("assignment", "student", "score", "graded_by", "submitted_at", "graded_at")
    list_filter = ("assignment__course",)
    search_fields = ("student__username", "student__full_name", "assignment__title")
