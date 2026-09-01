import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.courses.models import Course, ClassGroup, ClassEnrollment

User = get_user_model()

@pytest.mark.django_db
def test_courses_and_classes_flow():
    teacher = User.objects.create_user(
        username="GV_CLASS_TEST",
        password="Pass@2026",
        full_name="Thầy Nam Test",
        role=User.Role.TEACHER,
        is_staff=True
    )
    student = User.objects.create_user(
        username="STD_CLASS_TEST",
        password="Pass@2026",
        full_name="Học Viên Lớp Test",
        role=User.Role.STUDENT
    )

    course = Course.objects.create(
        id="course-test",
        code="TEST-01",
        title="Khóa Học Kiểm Thử",
        total_sessions=6
    )

    class_group = ClassGroup.objects.create(
        id="K26-TEST01",
        name="Lớp Kiểm Thử K26",
        course=course,
        teacher=teacher,
        room="Phòng LAB 01"
    )

    # 1. Đăng ký học viên vào lớp
    enrollment = ClassEnrollment.objects.create(
        class_group=class_group,
        student=student
    )
    assert enrollment.class_group.id == "K26-TEST01"
    assert enrollment.student.username == "STD_CLASS_TEST"

    # 2. Truy vấn API lớp học (Authenticated)
    client = APIClient()
    client.force_authenticate(user=teacher)
    resp = client.get("/api/v1/courses/api/classes/")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) >= 1
    found_class = next(c for c in results if c["id"] == "K26-TEST01")
    assert found_class["course_title"] == "Khóa Học Kiểm Thử"
    assert found_class["teacher_name"] == "Thầy Nam Test"
    assert found_class["enrolled_count"] == 1
