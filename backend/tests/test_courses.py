import pytest
from rest_framework.test import APIClient
from apps.courses.models import Course

@pytest.mark.django_db
def test_course_list_api():
    Course.objects.create(id="mos-word", code="MOS-WORD", title="MOS Word 2026", is_published=True)
    Course.objects.create(id="draft-course", code="DRAFT", title="Khóa Nháp", is_published=False)

    client = APIClient()
    response = client.get("/api/v1/courses/")
    assert response.status_code == 200
    data = response.json()
    # Chỉ trả về khóa học đã công khai
    assert len(data) == 1
    assert data[0]["code"] == "MOS-WORD"

@pytest.mark.django_db
def test_course_detail_api():
    Course.objects.create(id="ic3-gs6", code="IC3-GS6", title="Chuẩn Tin Học Quốc Tế IC3 GS6", is_published=True)

    client = APIClient()
    response = client.get("/api/v1/courses/ic3-gs6/")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Chuẩn Tin Học Quốc Tế IC3 GS6"
