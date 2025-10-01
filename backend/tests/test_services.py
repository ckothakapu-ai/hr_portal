import pytest
from fastapi.testclient import TestClient
from io import BytesIO
from sqlalchemy.orm import Session
from app.auth.models import User

def get_token(client: TestClient, email: str, password: str) -> str:
    response = client.post(
        "/token",
        data={"username": email, "password": password},
    )
    return response.json()["access_token"]

@pytest.fixture(scope="function")
def auth_headers(client: TestClient):
    client.post("/users/", json={"email": "candidate@example.com", "password": "password"})
    token = get_token(client, "candidate@example.com", "password")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def hr_auth_headers(client: TestClient, db_session: Session):
    # Create an HR user for testing
    client.post("/users/", json={"email": "hr@example.com", "password": "password"})
    user = db_session.query(User).filter(User.email == "hr@example.com").first()
    user.is_hr = True
    db_session.commit()

    token = get_token(client, "hr@example.com", "password")
    return {"Authorization": f"Bearer {token}"}

def test_create_job_as_hr(client: TestClient, hr_auth_headers: dict):
    response = client.post(
        "/hr/jobs/",
        headers=hr_auth_headers,
        json={"title": "Software Engineer", "description": "A great job."},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Software Engineer"

def test_create_job_as_non_hr(client: TestClient, auth_headers: dict):
    response = client.post(
        "/hr/jobs/",
        headers=auth_headers,
        json={"title": "This Should Fail", "description": "A test."},
    )
    assert response.status_code == 403

def test_read_jobs(client: TestClient, hr_auth_headers: dict):
    # Create a job first to ensure the list is not empty
    client.post(
        "/hr/jobs/",
        headers=hr_auth_headers,
        json={"title": "Test Job for Reading", "description": "A great job."},
    )
    response = client.get("/candidate/jobs/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_apply_for_job(client: TestClient, auth_headers: dict, hr_auth_headers: dict):
    job_res = client.post(
        "/hr/jobs/",
        headers=hr_auth_headers,
        json={"title": "Job to Apply For", "description": "Please apply."},
    )
    job_id = job_res.json()["id"]

    response = client.post(
        f"/candidate/jobs/{job_id}/apply",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["job_id"] == job_id

def test_upload_document(client: TestClient, auth_headers: dict):
    response = client.post(
        "/candidate/documents/upload",
        headers=auth_headers,
        files={"file": ("resume.pdf", BytesIO(b"my resume content"), "application/pdf")},
    )
    assert response.status_code == 200
    assert "file 'resume.pdf' stored at" in response.json()["info"]

def test_read_applications_for_job_as_hr(client: TestClient, auth_headers: dict, hr_auth_headers: dict):
    job_res = client.post(
        "/hr/jobs/",
        headers=hr_auth_headers,
        json={"title": "Another Job", "description": "Dev job."},
    )
    job_id = job_res.json()["id"]

    client.post(
        f"/candidate/jobs/{job_id}/apply",
        headers=auth_headers,
    )

    response = client.get(
        f"/hr/jobs/{job_id}/applications",
        headers=hr_auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_update_application_status_as_hr(client: TestClient, auth_headers: dict, hr_auth_headers: dict):
    job_res = client.post(
        "/hr/jobs/",
        headers=hr_auth_headers,
        json={"title": "Status Update Job", "description": "A job."},
    )
    job_id = job_res.json()["id"]

    apply_res = client.post(
        f"/candidate/jobs/{job_id}/apply",
        headers=auth_headers,
    )
    application_id = apply_res.json()["id"]

    response = client.put(
        f"/hr/applications/{application_id}",
        headers=hr_auth_headers,
        json={"status": "reviewed"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "reviewed"