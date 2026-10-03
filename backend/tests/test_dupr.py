import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import User, Friend

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Clean up test users and friends
    db.query(User).filter(User.phone == "+19998887777").delete()
    db.query(Friend).filter(Friend.phone == "+19998886666").delete()
    db.commit()
    db.close()
    from app.dupr_client import dupr_service
    dupr_service.access_token = None
    dupr_service.auth_type = "none"
    yield
    dupr_service.access_token = None
    dupr_service.auth_type = "none"

def test_dupr_status_endpoint():
    response = client.get("/api/dupr/status")
    assert response.status_code == 200
    data = response.json()
    assert "connected" in data
    assert "auth_type" in data

def test_dupr_connect_with_token():
    response = client.post("/api/dupr/connect", json={"token": "mock_jwt_token_123"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"

    status_res = client.get("/api/dupr/status")
    assert status_res.json()["connected"] is True
    assert status_res.json()["auth_type"] == "bearer_token"

def test_dupr_lookup_with_mocked_dupr_api():
    # Mock dupr_service.lookup_player_by_id
    mock_result = {
        "status": "SUCCESS",
        "dupr_id": "ABC789",
        "name": "Sarah Connor",
        "doubles_rating": 4.35,
        "singles_rating": 4.10,
        "doubles_provisional": False,
        "singles_provisional": False,
        "verified": True,
        "source": "dupr_api",
    }
    with patch("app.routers.friends.dupr_service.lookup_player_by_id", return_value=mock_result):
        response = client.get("/api/dupr/player/ABC789")
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is True
        assert data["doubles_rating"] == 4.35
        assert data["singles_rating"] == 4.10
        assert data["name"] == "Sarah Connor"

def test_dupr_lookup_auto_updates_user_in_db():
    # Register a user with DUPR ID "XYZ123"
    reg = client.post("/api/register", json={
        "name": "John Connor",
        "phone": "+19998887777",
        "dupr_id": "XYZ123",
    })
    assert reg.status_code == 200

    # Mock official DUPR return with new ratings
    mock_result = {
        "status": "SUCCESS",
        "dupr_id": "XYZ123",
        "name": "John Connor",
        "doubles_rating": 4.88,
        "singles_rating": 4.62,
        "doubles_provisional": False,
        "singles_provisional": False,
        "verified": True,
        "source": "dupr_api",
    }
    with patch("app.routers.friends.dupr_service.lookup_player_by_id", return_value=mock_result):
        # Trigger lookup
        res = client.get("/api/dupr/player/XYZ123")
        assert res.status_code == 200

        # Verify DB user was auto-updated with the official ratings
        db = SessionLocal()
        user = db.query(User).filter(User.dupr_id == "XYZ123").first()
        assert user is not None
        assert user.dupr_doubles_rating == 4.88
        assert user.dupr_singles_rating == 4.62
        db.close()
