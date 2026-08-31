import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_create_user_and_password_hashing():
    user = User.objects.create_user(
        username="THGZ99",
        password="SecurePassword@2026",
        full_name="Nguyễn Văn Test",
        role=User.Role.STUDENT
    )
    assert user.username == "THGZ99"
    # Mật khẩu KHÔNG ĐƯỢC lưu plain-text
    assert user.password != "SecurePassword@2026"
    assert user.check_password("SecurePassword@2026") is True
    assert user.check_password("wrong_password") is False
    assert user.role == User.Role.STUDENT

@pytest.mark.django_db
def test_user_login_api_success():
    User.objects.create_user(
        username="THGZ01",
        password="ValidPassword@2026",
        full_name="Học Viên Chuẩn",
        role=User.Role.STUDENT
    )
    client = APIClient()
    response = client.post("/api/v1/accounts/login/", {
        "username": "THGZ01",
        "password": "ValidPassword@2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Đăng nhập thành công."
    assert data["user"]["username"] == "THGZ01"
    assert data["user"]["role"] == "student"

@pytest.mark.django_db
def test_user_login_api_failure():
    client = APIClient()
    response = client.post("/api/v1/accounts/login/", {
        "username": "NONEXISTENT",
        "password": "WrongPassword"
    })
    assert response.status_code == 401
    assert "error" in response.json()
