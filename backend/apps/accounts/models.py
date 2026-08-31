import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Người dùng bắt buộc phải có tên đăng nhập / mã tài khoản")
        username = username.strip().upper()
        user = self.model(username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT = "student", "Học viên"
        TEACHER = "teacher", "Giảng viên"
        ACADEMIC = "academic", "Giáo vụ học vụ"
        ADMIN = "admin", "Quản trị hệ thống"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField("Mã tài khoản", max_length=50, unique=True, db_index=True)
    email = models.EmailField("Địa chỉ Email", unique=True, null=True, blank=True)
    full_name = models.CharField("Họ và tên", max_length=150)
    phone = models.CharField("Số điện thoại", max_length=20, blank=True, default="")
    role = models.CharField("Vai trò", max_length=20, choices=Role.choices, default=Role.STUDENT, db_index=True)
    
    # Metadata trường lớp
    student_code = models.CharField("Mã học viên", max_length=50, blank=True, default="")
    teacher_code = models.CharField("Mã giảng viên", max_length=50, blank=True, default="")
    class_code = models.CharField("Mã lớp học", max_length=50, blank=True, default="")
    school_or_class = models.CharField("Đơn vị / Lớp", max_length=255, blank=True, default="")
    program_track = models.CharField("Chương trình đào tạo", max_length=50, blank=True, default="office-fast-3in1")
    
    # Security Flags
    must_change_password = models.BooleanField("Bắt buộc đổi mật khẩu", default=False)
    is_active = models.BooleanField("Đang kích hoạt", default=True)
    is_staff = models.BooleanField("Quyền truy cập admin", default=False)
    date_joined = models.DateTimeField("Ngày tham gia", default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        verbose_name = "Người dùng"
        verbose_name_plural = "Danh sách Người dùng"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.username} — {self.full_name} ({self.get_role_display()})"
