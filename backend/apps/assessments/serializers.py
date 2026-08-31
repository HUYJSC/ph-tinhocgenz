from rest_framework import serializers
from .models import Question, Exam, ExamAttempt

class QuestionPublicSerializer(serializers.ModelSerializer):
    """Serializer cho câu hỏi khi gửi về client làm bài - ẨN ĐÁP ÁN ĐÚNG!"""
    class Meta:
        model = Question
        fields = ["id", "skill_id", "content", "options", "difficulty"]

class QuestionDetailSerializer(serializers.ModelSerializer):
    """Serializer đầy đủ cho Giảng viên / Admin xem và chấm điểm"""
    class Meta:
        model = Question
        fields = "__all__"

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = "__all__"

class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAttempt
        fields = "__all__"
        read_only_fields = ["id", "started_at", "submitted_at", "score", "percentage", "is_passed"]
