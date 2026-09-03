from django.db import models
from django.contrib.auth import authenticate, login, logout
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .authentication import generate_tokens_for_user, verify_refresh_token
from .permissions import IsAdmin, IsTeacherOrAdmin, IsOwnerOrStaff

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data["username"].strip().upper()
        password = serializer.validated_data["password"]

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {"error": "Tài khoản hoặc mật khẩu không chính xác."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active or user.is_deleted:
            return Response(
                {"error": "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ Giáo vụ."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Hỗ trợ cả Session (Django Admin) và JWT (Mobile / SPA)
        login(request, user)
        tokens = generate_tokens_for_user(user)

        return Response({
            "message": "Đăng nhập thành công.",
            "tokens": tokens,
            "user": UserSerializer(user).data
        })

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        refresh_token = serializer.validated_data["refresh_token"]
        user = verify_refresh_token(refresh_token)
        new_tokens = generate_tokens_for_user(user)

        return Response({
            "message": "Làm mới token thành công.",
            "tokens": new_tokens
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Đã đăng xuất khỏi hệ thống."})

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"error": "Mật khẩu hiện tại không đúng."},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_password = serializer.validated_data["new_password"]
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        return Response({"message": "Đổi mật khẩu thành công. Mật khẩu mới đã được cập nhật."})

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"].strip()
        channel = serializer.validated_data.get("delivery_channel", "email")

        user = User.objects.filter(is_deleted=False).filter(
            models.Q(username__iexact=identifier) |
            models.Q(email__iexact=identifier) |
            models.Q(phone__iexact=identifier) |
            models.Q(student_code__iexact=identifier) |
            models.Q(teacher_code__iexact=identifier)
        ).first()

        if not user:
            return Response(
                {"error": "Không tìm thấy tài khoản phù hợp với thông tin đã nhập."},
                status=status.HTTP_404_NOT_FOUND
            )

        import random
        from django.core.cache import cache
        otp_code = f"{random.randint(100000, 999999)}"
        cache_key = f"pwd_reset_otp_{user.username.upper()}"
        cache.set(cache_key, otp_code, timeout=600)

        destination = user.email if channel == "email" and user.email else user.phone or user.email or "liên hệ giáo vụ"
        masked_dest = destination[:3] + "****" + destination[-3:] if destination and len(destination) > 6 else destination

        return Response({
            "message": f"Mã xác nhận 6 số đã được gửi tới {masked_dest}.",
            "channel": channel,
            "username": user.username,
            "role": user.role,
            "dev_otp_preview": otp_code
        })

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data["identifier"].strip()
        otp_code = serializer.validated_data["otp_code"].strip()
        new_password = serializer.validated_data["new_password"]

        user = User.objects.filter(is_deleted=False).filter(
            models.Q(username__iexact=identifier) |
            models.Q(email__iexact=identifier) |
            models.Q(phone__iexact=identifier) |
            models.Q(student_code__iexact=identifier) |
            models.Q(teacher_code__iexact=identifier)
        ).first()

        if not user:
            return Response({"error": "Không tìm thấy tài khoản."}, status=status.HTTP_404_NOT_FOUND)

        from django.core.cache import cache
        cache_key = f"pwd_reset_otp_{user.username.upper()}"
        cached_otp = cache.get(cache_key)

        if cached_otp and cached_otp != otp_code:
            return Response({"error": "Mã xác nhận không chính xác hoặc đã hết hạn."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        cache.delete(cache_key)

        return Response({"message": f"Đã đặt lại mật khẩu mới cho tài khoản {user.username} thành công!"})

class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD API quản lý người dùng (Học viên, Giảng viên):
    - Admin: Toàn quyền CRUD.
    - Giảng viên: Xem danh sách học viên.
    - Tự động lọc các bản ghi chưa bị xóa mềm.
    """
    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            permission_classes = [IsAdmin]
        elif self.action in ["list", "retrieve"]:
            permission_classes = [IsTeacherOrAdmin]
        else:
            permission_classes = [IsOwnerOrStaff]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        class_code = self.request.query_params.get("class_code")
        if class_code:
            qs = qs.filter(class_code=class_code)
        program_track = self.request.query_params.get("program_track")
        if program_track:
            qs = qs.filter(program_track=program_track)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(full_name__icontains=search) | qs.filter(username__icontains=search)
        return qs

    def perform_destroy(self, instance):
        # Soft delete thay vì xóa cứng
        instance.soft_delete()
