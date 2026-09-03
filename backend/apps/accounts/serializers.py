from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "full_name", "phone",
            "role", "student_code", "teacher_code", "class_code",
            "school_or_class", "program_track", "birth_year",
            "parent_name", "parent_phone", "parent_zalo",
            "must_change_password", "is_active", "is_deleted",
            "date_joined", "updated_at"
        ]
        read_only_fields = ["id", "username", "date_joined", "updated_at"]

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, default="Student@2026")

    class Meta:
        model = User
        fields = [
            "username", "password", "email", "full_name", "phone",
            "role", "student_code", "teacher_code", "class_code",
            "school_or_class", "program_track", "birth_year",
            "parent_name", "parent_phone", "parent_zalo",
            "must_change_password"
        ]

    def create(self, validated_data):
        password = validated_data.pop("password", "Student@2026")
        user = User.objects.create_user(password=password, **validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True)

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, min_length=6, write_only=True)

class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True, help_text="Mã tài khoản, Gmail hoặc Số điện thoại")
    delivery_channel = serializers.ChoiceField(choices=["email", "phone"], default="email")

class PasswordResetConfirmSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    otp_code = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, min_length=6, write_only=True)
