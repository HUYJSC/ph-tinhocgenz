import uuid
from django.db import models
from django.conf import settings
from apps.courses.models import Course

class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="assignments")
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_assignments")
    title = models.CharField("Tiêu đề bài tập", max_length=255)
    description = models.TextField("Yêu cầu bài tập", blank=True, default="")
    due_date = models.DateTimeField("Hạn nộp bài", null=True, blank=True)
    is_open = models.BooleanField("Đang mở nộp bài", default=True)
    drive_folder_id = models.CharField("Google Drive Folder ID", max_length=100, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Bài tập thực hành"
        verbose_name_plural = "Danh sách Bài tập thực hành"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class Submission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="submissions")
    submitted_at = models.DateTimeField(auto_now_add=True)
    file_url = models.URLField("Đường dẫn file nộp", max_length=500)
    score = models.FloatField("Điểm số", null=True, blank=True)
    feedback = models.TextField("Nhận xét của giảng viên", blank=True, default="")
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="graded_submissions")
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Bài nộp học viên"
        verbose_name_plural = "Danh sách Bài nộp"
        unique_together = ("assignment", "student")

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"
