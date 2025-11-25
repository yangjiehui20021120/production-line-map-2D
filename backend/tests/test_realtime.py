from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_realtime_entities() -> None:
    response = client.get("/api/v1/realtime/entities")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "equipment" in data["data"]

