import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_health_check_endpoint():
    client = APIClient()
    response = client.get("/api/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "PH Digital Education" in data["service"]

@pytest.mark.django_db
def test_healthz_bare_and_slash():
    client = APIClient()
    res1 = client.get("/healthz")
    assert res1.status_code == 200
    assert res1.json()["status"] == "healthy"

    res2 = client.get("/healthz/")
    assert res2.status_code == 200
    assert res2.json()["status"] == "healthy"
