import pytest
from fastapi.testclient import TestClient

def test_create_user(client: TestClient):
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_create_user_existing_email(client: TestClient):
    client.post(
        "/users/",
        json={"email": "test1@example.com", "password": "testpassword"},
    )
    response = client.post(
        "/users/",
        json={"email": "test1@example.com", "password": "testpassword"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login(client: TestClient):
    client.post(
        "/users/",
        json={"email": "testlogin@example.com", "password": "testpassword"},
    )
    response = client.post(
        "/token",
        data={"username": "testlogin@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
    assert json_data["token_type"] == "bearer"

def test_login_incorrect_password(client: TestClient):
    client.post(
        "/users/",
        json={"email": "testlogin2@example.com", "password": "testpassword"},
    )
    response = client.post(
        "/token",
        data={"username": "testlogin2@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"