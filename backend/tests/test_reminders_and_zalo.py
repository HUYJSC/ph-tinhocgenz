import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.analytics.models import StudentReminder, ZaloNotificationLog

User = get_user_model()

@pytest.mark.django_db
def test_student_reminder_and_zalo_flow():
    teacher = User.objects.create_user(
        username="GV_ANALYTICS",
        password="Pass@2026",
        full_name="Giảng Viên Giám Sát",
        role=User.Role.TEACHER,
        is_staff=True
    )
    student = User.objects.create_user(
        username="STD_REMINDER",
        password="Pass@2026",
        full_name="Học Viên Cài Đặt",
        role=User.Role.STUDENT,
        birth_year=2004,
        parent_name="Bác Nguyễn Văn An",
        parent_phone="0912111333"
    )

    # 1. Tạo cài đặt nhắc nhở
    reminder = StudentReminder.objects.create(
        student=student,
        daily=True,
        weekly=True,
        monthly=False,
        preferred_time="20:00",
        parent_name="Bác Nguyễn Văn An",
        parent_phone="0912111333",
        birth_year=2004
    )
    assert reminder.student.username == "STD_REMINDER"
    assert reminder.preferred_time == "20:00"

    # 2. Học viên tra cứu cài đặt nhắc nhở của mình
    client_student = APIClient()
    client_student.force_authenticate(user=student)
    resp = client_student.get("/api/v1/analytics/reminders/")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 1
    assert results[0]["preferred_time"] == "20:00"

    # 3. Tạo bản ghi Zalo AI Log
    zalo_log = ZaloNotificationLog.objects.create(
        student=student,
        recipient_type=ZaloNotificationLog.RecipientType.PARENT,
        recipient_name="Bác Nguyễn Văn An",
        recipient_phone="0912111333",
        cycle=ZaloNotificationLog.Cycle.WEEKLY,
        ai_generated_message="PH EDU thông báo kết quả học tập tuần qua của học viên.",
        status="sent"
    )
    assert zalo_log.recipient_type == "parent"

    # 4. Giảng viên tra cứu nhật ký Zalo
    client_teacher = APIClient()
    client_teacher.force_authenticate(user=teacher)
    zalo_resp = client_teacher.get("/api/v1/analytics/zalo-logs/")
    assert zalo_resp.status_code == 200
    assert len(zalo_resp.json()) >= 1
