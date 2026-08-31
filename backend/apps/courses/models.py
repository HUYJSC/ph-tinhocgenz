from django.db import models

class Course(models.Model):
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
