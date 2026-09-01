import uuid
from django.db import models
from django.conf import settings
from apps.common.models import BaseModel
from apps.courses.models import Course

class Question(BaseModel):
    class Difficulty(models.TextChoices):
        EASY = "easy", "Cơ bản"
        MEDIUM = "medium", "Trung bình"
        HARD = "hard", "Nâng cao"

    id = models.CharField(max_length=100, primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="questions", null=True, blank=True)
    skill_id = models.CharField("Mã kỹ năng", max_length=100, db_index=True)
    content = models.TextField("Nội dung câu hỏi")
    options = models.JSONField("Danh sách phương án", default=list)
    correct_answer_id = models.CharField("Mã đáp án đúng", max_length=20)
    explanation = models.TextField("Giải thích đáp án", blank=True, default="")
    difficulty = models.CharField("Độ khó", max_length=20, choices=Difficulty.choices, default=Difficulty.MEDIUM)

    class Meta:
        verbose_name = "Câu hỏi khảo thí"
        verbose_name_plural = "Ngân hàng câu hỏi"

    def __str__(self):
        return f"[{self.skill_id}] {self.content[:60]}..."

class Exam(BaseModel):
    id = models.CharField(max_length=100, primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="exams")
    title = models.CharField("Tiêu đề đề thi", max_length=255)
    description = models.TextField("Mô tả bài thi", blank=True, default="")
    duration_minutes = models.IntegerField("Thời gian thi (phút)", default=45)
    passing_percentage = models.IntegerField("Điểm đạt chuẩn (%)", default=70)
    is_published = models.BooleanField("Đang mở thi", default=True)

    class Meta:
        verbose_name = "Đề thi"
        verbose_name_plural = "Kho đề thi"

    def __str__(self):
        return f"{self.title} ({self.course.code})"

class ExamAttempt(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="attempts")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="exam_attempts")
    started_at = models.DateTimeField("Bắt đầu làm bài", auto_now_add=True)
    submitted_at = models.DateTimeField("Nộp bài lúc", null=True, blank=True)
    score = models.IntegerField("Số câu đúng", default=0)
    total_questions = models.IntegerField("Tổng số câu", default=0)
    percentage = models.FloatField("Tỷ lệ %", default=0.0)
    is_passed = models.BooleanField("Đạt chuẩn", default=False)
    switch_tab_count = models.IntegerField("Số lần rời tab", default=0)
    answers_draft = models.JSONField("Bản nháp câu trả lời", default=dict)

    class Meta:
        verbose_name = "Lượt thi học viên"
        verbose_name_plural = "Danh sách lượt thi"
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.student.username} - {self.exam.title} ({self.percentage}%)"
