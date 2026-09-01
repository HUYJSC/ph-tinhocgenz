from rest_framework import serializers
from .models import AcademicWarning, StudentReminder, ZaloNotificationLog

class AcademicWarningSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)

    class Meta:
        model = AcademicWarning
        fields = [
            "id", "student", "student_name", "student_code",
            "risk_level", "reasons", "is_resolved", "resolution_notes",
            "created_at", "updated_at", "is_deleted"
        ]
        read_only_fields = ["created_at", "updated_at"]

class StudentReminderSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)

    class Meta:
        model = StudentReminder
        fields = [
            "id", "student", "student_name", "student_code",
            "daily", "weekly", "monthly", "preferred_time",
            "parent_name", "parent_phone", "parent_zalo", "birth_year",
            "created_at", "updated_at", "is_deleted"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

class ZaloNotificationLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)

    class Meta:
        model = ZaloNotificationLog
        fields = [
            "id", "student", "student_name", "student_code",
            "recipient_type", "recipient_name", "recipient_phone",
            "cycle", "ai_generated_message", "status",
            "created_at", "updated_at", "is_deleted"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
