from django.db import models
from django.utils import timezone

class ActiveManager(models.Manager):
    """Chỉ truy vấn các bản ghi chưa bị xóa mềm (is_deleted=False)."""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class BaseModel(models.Model):
    """
    Base model dùng chung cho toàn bộ các thực thể trong hệ thống:
    - created_at: Thời điểm tạo bản ghi (tự động, có index).
    - updated_at: Thời điểm cập nhật cuối cùng.
    - is_deleted: Đánh dấu xóa mềm (soft delete, có index).
    """
    created_at = models.DateTimeField("Ngày tạo", default=timezone.now, db_index=True)
    updated_at = models.DateTimeField("Ngày cập nhật", auto_now=True)
    is_deleted = models.BooleanField("Đã xóa mềm", default=False, db_index=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        """Xóa mềm bản ghi thay vì xóa cứng khỏi cơ sở dữ liệu."""
        self.is_deleted = True
        self.save(update_fields=["is_deleted", "updated_at"])

    def restore(self):
        """Khôi phục bản ghi đã xóa mềm."""
        self.is_deleted = False
        self.save(update_fields=["is_deleted", "updated_at"])
