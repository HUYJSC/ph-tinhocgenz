import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.courses.models import Course, ClassGroup
from apps.assignments.models import Assignment, Submission

User = get_user_model()

@pytest.mark.django_db
def test_assignment_and_grading_flow():
    teacher = User.objects.create_user(
        username="GV_ASSIGN",
        password="Pass@2026",
        full_name="Thầy Huy Giảng Viên",
        role=User.Role.TEACHER,
        is_staff=True
    )
    student = User.objects.create_user(
        username="STD_ASSIGN",
        password="Pass@2026",
        full_name="Học Viên Nộp Bài",
        role=User.Role.STUDENT
    )
    course = Course.objects.create(
        id="c-assign",
        code="C-ASSIGN",
        title="Môn Thực Hành Word",
        total_sessions=6
    )

    # 1. Giáo viên tạo bài tập thực hành
    client_teacher = APIClient()
    client_teacher.force_authenticate(user=teacher)
    assign_resp = client_teacher.post("/api/v1/assignments/tasks/", {
        "course": "c-assign",
        "title": "Bài tập 1: Soạn thảo văn bản",
        "description": "Làm bài theo mẫu file gửi kèm."
    })
    assert assign_resp.status_code == 201
    assign_id = assign_resp.json()["id"]

    # 2. Học viên nộp bài tập
    client_student = APIClient()
    client_student.force_authenticate(user=student)
    submit_resp = client_student.post("/api/v1/assignments/submissions/", {
        "assignment": assign_id,
        "file_url": "https://storage.tinhocgenz.io.vn/submissions/student1.docx"
    })
    assert submit_resp.status_code == 201
    submission_id = submit_resp.json()["id"]

    # 3. Giáo viên chấm điểm và nhận xét
    grade_resp = client_teacher.post(f"/api/v1/assignments/submissions/{submission_id}/grade/", {
        "score": 9.5,
        "feedback": "Bài làm rất chuẩn xác, đạt yêu cầu!"
    })
    assert grade_resp.status_code == 200
    graded_data = grade_resp.json()["submission"]
    assert graded_data["score"] == 9.5
    assert graded_data["feedback"] == "Bài làm rất chuẩn xác, đạt yêu cầu!"
    assert graded_data["grader_name"] == "Thầy Huy Giảng Viên"
