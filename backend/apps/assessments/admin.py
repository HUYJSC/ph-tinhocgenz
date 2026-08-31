from django.contrib import admin
from .models import Question, Exam, ExamAttempt

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "skill_id", "difficulty", "correct_answer_id", "created_at")
    list_filter = ("course", "difficulty", "skill_id")
    search_fields = ("content", "skill_id", "explanation")

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "duration_minutes", "passing_percentage", "is_published")
    list_filter = ("course", "is_published")
    search_fields = ("title", "description")

@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ("exam", "student", "score", "total_questions", "percentage", "is_passed", "switch_tab_count", "started_at")
    list_filter = ("is_passed", "exam__course")
    search_fields = ("student__username", "student__full_name", "exam__title")
    ordering = ("-started_at",)
