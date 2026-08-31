import datetime
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.courses.models import Course
from apps.attendance.models import AttendanceSession, AttendanceRecord

User = get_user_model()

@pytest.mark.django_db
def test_attendance_checkin_flow():
    teacher = User.objects.create_user(username="GV09", password="Password123!", role=User.Role.TEACHER, full_name="Thầy Nam")
    student = User.objects.create_user(username="THGZ88", password="Password123!", role=User.Role.STUDENT, full_name="Lê An", class_code="K26-WE01")
    course = Course.objects.create(id="test-course", code="TEST", title="Khóa Test")

    session = AttendanceSession.objects.create(
        course=course,
        teacher=teacher,
        class_code="K26-WE01",
        session_title="Buổi 1: Giới thiệu hệ thống",
        session_number=1,
        session_date=datetime.date.today(),
        is_open=True,
        pin_code="7890"
    )

    client = APIClient()
    client.force_authenticate(user=student)

    # 1. Quét sai PIN
    res_fail = client.post(f"/api/v1/attendance/sessions/{session.id}/checkin/", {"pin_code": "0000"})
    assert res_fail.status_code == 400
    assert "error" in res_fail.json()

    # 2. Quét đúng PIN
    res_ok = client.post(f"/api/v1/attendance/sessions/{session.id}/checkin/", {"pin_code": "7890", "location": "21.0285, 105.8542"})
    assert res_ok.status_code == 201
    assert res_ok.json()["message"] == "Điểm danh thành công!"

    # Kiểm tra record trong DB
    record = AttendanceRecord.objects.get(session=session, student=student)
    assert record.status == AttendanceRecord.Status.PRESENT
    assert record.verified_location == "21.0285, 105.8542"
