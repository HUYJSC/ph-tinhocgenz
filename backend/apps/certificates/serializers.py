from rest_framework import serializers
from .models import DigitalCertificate

class DigitalCertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_code = serializers.CharField(source="student.username", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = DigitalCertificate
        fields = [
            "id", "certificate_code", "student_name", "student_code",
            "course_title", "final_score", "issued_at", "blockchain_hash", "is_revoked"
        ]
