from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id", "code", "title", "short_desc",
            "total_sessions", "target_badge", "is_published", "order_index"
        ]
