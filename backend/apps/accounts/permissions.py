from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()

class IsSuperAdmin(BasePermission):
    """Quyền truy cập tối thượng dành riêng cho Super Admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.SUPER_ADMIN or request.user.is_superuser)
        )

class IsAdmin(BasePermission):
    """Quyền truy cập dành cho Quản trị viên hoặc Super Admin."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.ADMIN, User.Role.SUPER_ADMIN] or request.user.is_superuser)
        )

class IsTeacherOrAdmin(BasePermission):
    """Quyền truy cập dành cho Giảng viên hoặc Quản trị viên."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.TEACHER, User.Role.ADMIN, User.Role.SUPER_ADMIN] or request.user.is_superuser)
        )

class IsAcademicOrAdmin(BasePermission):
    """Quyền truy cập dành cho Giáo vụ học vụ hoặc Quản trị viên."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in [User.Role.ACADEMIC, User.Role.ADMIN, User.Role.SUPER_ADMIN] or request.user.is_superuser)
        )

class IsStudent(BasePermission):
    """Quyền truy cập dành cho Học viên."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.STUDENT
        )

class IsOwnerOrStaff(BasePermission):
    """
    Quyền đối tượng: Cho phép học viên sở hữu tài nguyên hoặc Cán bộ/Quản trị viên thao tác.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff luôn có toàn quyền
        if request.user.role in [User.Role.TEACHER, User.Role.ACADEMIC, User.Role.ADMIN, User.Role.SUPER_ADMIN] or request.user.is_superuser:
            return True

        # Nếu đối tượng chính là User
        if obj == request.user:
            return True

        # Nếu đối tượng có thuộc tính student hoặc user
        if hasattr(obj, "student") and obj.student == request.user:
            return True
        if hasattr(obj, "user") and obj.user == request.user:
            return True

        return False
