import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.accounts.authentication import generate_tokens_for_user

User = get_user_model()

@pytest.mark.django_db
def test_jwt_generation_and_bearer_auth():
    user = User.objects.create_user(
        username="JWT_STUDENT_01",
        password="Password@2026",
        full_name="Nguyễn JWT",
        role=User.Role.STUDENT
    )

    client = APIClient()
    # 1. Login lấy tokens
    login_resp = client.post("/api/v1/accounts/login/", {
        "username": "JWT_STUDENT_01",
        "password": "Password@2026"
    })
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "tokens" in data
    assert "access" in data["tokens"]
    assert "refresh" in data["tokens"]

    access_token = data["tokens"]["access"]
    refresh_token = data["tokens"]["refresh"]

    # 2. Dùng Bearer Access Token truy cập endpoint được bảo vệ
    client_auth = APIClient()
    client_auth.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    me_resp = client_auth.get("/api/v1/accounts/me/")
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "JWT_STUDENT_01"

    # 3. Refresh token để lấy token mới
    refresh_resp = client.post("/api/v1/accounts/token/refresh/", {
        "refresh_token": refresh_token
    })
    assert refresh_resp.status_code == 200
    new_data = refresh_resp.json()
    assert "tokens" in new_data
    assert "access" in new_data["tokens"]

@pytest.mark.django_db
def test_jwt_invalid_token():
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION="Bearer invalid.token.value")
    response = client.get("/api/v1/accounts/me/")
    assert response.status_code == 403 or response.status_code == 401
