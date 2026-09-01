from rest_framework import serializers
from .models import Course, ClassGroup, ClassEnrollment

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id", "code", "title", "short_desc",
            "total_sessions", "target_badge", "is_published", "order_index",
            "created_at", "updated_at", "is_deleted"
        ]
        read_only_fields = ["created_at", "updated_at"]

class ClassGroupSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    enrolled_count = serializers.IntegerField(source="enrollments.count", read_only=True)

    class Meta:
        model = ClassGroup
        fields = [
            "id", "name", "course", "course_title",
            "teacher", "teacher_name", "room", "schedule_desc",
            "max_students", "enrolled_count", "is_active",
            "created_at", "updated_at", "is_deleted"
        ]
        read_only_fields = ["created_at", "updated_at"]

class ClassEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    class_name = serializers.CharField(source="class_group.name", read_only=True)

    class Meta:
        model = ClassEnrollment
        fields = [
            "id", "class_group", "class_name", "student",
            "student_name", "student_code", "enrolled_at", "is_deleted"
        ]
        read_only_fields = ["id", "enrolled_at"]
