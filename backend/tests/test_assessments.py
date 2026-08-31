import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.courses.models import Course
from apps.assessments.models import Exam, Question, ExamAttempt

User = get_user_model()

@pytest.mark.django_db
def test_server_side_grading_protects_answers():
    course = Course.objects.create(id="mos-excel", code="MOS-EXCEL", title="MOS Excel 2026")
    exam = Exam.objects.create(
        id="exam-excel-01",
        course=course,
        title="Đề Thi Thử MOS Excel",
        passing_percentage=70
    )
    q1 = Question.objects.create(
        id="q1",
        course=course,
        skill_id="excel_functions",
        content="Hàm nào dùng để dò tìm giá trị theo cột?",
        options=[
            {"id": "A", "text": "VLOOKUP"},
            {"id": "B", "text": "HLOOKUP"},
            {"id": "C", "text": "COUNTIF"},
            {"id": "D", "text": "SUMIF"}
        ],
        correct_answer_id="A"
    )

    student = User.objects.create_user(username="THGZ02", password="Password123!", full_name="Trần Thị Mai")

    client = APIClient()
    client.force_authenticate(user=student)

    # Nộp đáp án đúng "A"
    response = client.post(
        f"/api/v1/assessments/exams/{exam.id}/submit/",
        {
            "answers": {q1.id: "A"},
            "switch_tab_count": 0
        },
        format="json"
    )

    assert response.status_code == 201
    data = response.json()
    assert data["score"] == 1
    assert data["percentage"] == 100.0
    assert data["is_passed"] is True

    # Kiểm tra attempt trong DB
    attempt = ExamAttempt.objects.get(id=data["attempt_id"])
    assert attempt.student == student
    assert attempt.score == 1
