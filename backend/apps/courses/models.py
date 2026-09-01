import uuid
from django.db import models
from django.conf import settings
from apps.common.models import BaseModel

class Course(BaseModel):
    id = models.CharField("Mã định danh", max_length=50, primary_key=True)
    code = models.CharField("Mã môn học", max_length=30, unique=True, db_index=True)
    title = models.CharField("Tên chương trình đào tạo", max_length=255)
    short_desc = models.TextField("Mô tả ngắn", blank=True, default="")
    total_sessions = models.IntegerField("Tổng số buổi học", default=6)
    target_badge = models.CharField("Chứng chỉ chuẩn đầu ra", max_length=100, default="Certiport / Bộ GD&ĐT")
    is_published = models.BooleanField("Hiển thị công khai", default=True)
    order_index = models.IntegerField("Thứ tự hiển thị", default=0)

    class Meta:
        verbose_name = "Chương trình đào tạo"
        verbose_name_plural = "Danh sách Chương trình đào tạo"
        ordering = ["order_index", "code"]

    def __str__(self):
        return f"[{self.code}] {self.title}"


class ClassGroup(BaseModel):
    """
    Lớp học đào tạo thực tế (Class):
    Ví dụ: K26-WE01 (Tối 2-4-6 Thầy Huy), K26-CC01 (Thầy Nam).
    """
    id = models.CharField("Mã lớp học", max_length=50, primary_key=True)
    name = models.CharField("Tên lớp học", max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="classes")
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="teaching_classes"
    )
    room = models.CharField("Phòng học", max_length=150, default="Phòng LAB 01 (Tầng 2)")
    schedule_desc = models.CharField("Lịch học", max_length=255, default="Thứ 2-4-6 (18:30 - 20:30)")
    max_students = models.IntegerField("Sĩ số tối đa", default=25)
    is_active = models.BooleanField("Đang mở lớp", default=True)

    class Meta:
        verbose_name = "Lớp học"
        verbose_name_plural = "Danh sách Lớp học"
        ordering = ["id"]

    def __str__(self):
        teacher_name = self.teacher.full_name if self.teacher else "Chưa phân công"
        return f"[{self.id}] {self.name} — {teacher_name}"


class ClassEnrollment(BaseModel):
    """
    Học viên đăng ký/tham gia vào lớp học cụ thể.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE, related_name="enrollments")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField("Thời điểm vào lớp", auto_now_add=True)

    class Meta:
        verbose_name = "Đăng ký lớp học"
        verbose_name_plural = "Danh sách Đăng ký lớp học"
        unique_together = ("class_group", "student")
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.student.username} ({self.student.full_name}) -> {self.class_group.id}"
