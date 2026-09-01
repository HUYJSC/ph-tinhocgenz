from rest_framework import serializers
from .models import Assignment, Submission

class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    teacher_name = serializers.CharField(source="teacher.full_name", read_only=True)
    submissions_count = serializers.IntegerField(source="submissions.count", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id", "course", "course_title", "class_group", "teacher", "teacher_name",
            "title", "description", "due_date", "is_open", "drive_folder_id",
            "submissions_count", "created_at", "updated_at", "is_deleted"
        ]
        read_only_fields = ["id", "teacher", "created_at", "updated_at"]

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    grader_name = serializers.CharField(source="graded_by.full_name", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "assignment", "assignment_title", "student", "student_name",
            "student_code", "submitted_at", "file_url", "score", "feedback",
            "graded_by", "grader_name", "graded_at", "is_deleted"
        ]
        read_only_fields = ["id", "student", "submitted_at", "graded_at", "graded_by"]
