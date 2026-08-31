import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.courses.models import Course
from apps.certificates.models import DigitalCertificate

User = get_user_model()

@pytest.mark.django_db
def test_certificate_public_verification():
    course = Course.objects.create(id="mos-excel-cert", code="MOS-EXCEL-C", title="MOS Excel 2026")
    student = User.objects.create_user(username="THGZ77", password="Password123!", full_name="Hoàng Thị Yến")

    cert = DigitalCertificate.objects.create(
        certificate_code="PH-MOS-2026-TEST",
        student=student,
        course=course,
        final_score=95.0
    )

    # Khóa băm SHA-256 phải được tự động sinh ra khi save
    assert cert.blockchain_hash != ""
    assert len(cert.blockchain_hash) == 64

    # Tra cứu công khai không cần đăng nhập
    client = APIClient()
    response = client.get("/api/v1/certificates/verify/PH-MOS-2026-TEST/")
    assert response.status_code == 200
    data = response.json()
    assert data["certificate_code"] == "PH-MOS-2026-TEST"
    assert data["student_name"] == "Hoàng Thị Yến"
    assert data["final_score"] == 95.0
    assert data["blockchain_hash"] == cert.blockchain_hash
