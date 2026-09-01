import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_rbac_user_management():
    admin_user = User.objects.create_superuser(
        username="SUPER_ADMIN",
        password="AdminPassword@2026",
        full_name="Quản Trị Viên Trưởng"
    )

    teacher_user = User.objects.create_user(
        username="GV_TEST",
        password="TeacherPass@2026",
        full_name="Giảng Viên Test",
        role=User.Role.TEACHER,
        is_staff=True
    )

    student_user = User.objects.create_user(
        username="STD_TEST",
        password="StudentPass@2026",
        full_name="Học Viên Test",
        role=User.Role.STUDENT
    )

    # 1. Học viên không được phép xem danh sách toàn bộ User qua UserViewSet
    client_student = APIClient()
    client_student.force_authenticate(user=student_user)
    resp_student = client_student.get("/api/v1/accounts/users/")
    assert resp_student.status_code == 403

    # 2. Giảng viên được phép xem danh sách học viên
    client_teacher = APIClient()
    client_teacher.force_authenticate(user=teacher_user)
    resp_teacher = client_teacher.get("/api/v1/accounts/users/")
    assert resp_teacher.status_code == 200

    # 3. Giảng viên KHÔNG ĐƯỢC phép xóa tài khoản
    del_resp_teacher = client_teacher.delete(f"/api/v1/accounts/users/{student_user.id}/")
    assert del_resp_teacher.status_code == 403

    # 4. Admin có quyền xóa mềm (soft delete) tài khoản
    client_admin = APIClient()
    client_admin.force_authenticate(user=admin_user)
    del_resp_admin = client_admin.delete(f"/api/v1/accounts/users/{student_user.id}/")
    assert del_resp_admin.status_code == 204

    # Kiểm tra soft delete: is_deleted = True, is_active = False, bản ghi vẫn còn trong DB
    student_user.refresh_from_db()
    assert student_user.is_deleted is True
    assert student_user.is_active is False
