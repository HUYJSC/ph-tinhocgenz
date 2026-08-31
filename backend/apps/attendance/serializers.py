from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord

class AttendanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = "__all__"

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_code = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ["id", "session", "student", "student_name", "student_code", "status", "checkin_time", "verified_location", "note"]
        read_only_fields = ["id", "checkin_time"]
