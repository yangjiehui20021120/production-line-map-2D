from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def _get_sample_entity_id() -> str:
    response = client.get("/api/v1/trajectory/search")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data, "trajectory search should return at least one entry"
    return data[0]["id"]


def test_trajectory_search() -> None:
    response = client.get("/api/v1/trajectory/search")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert isinstance(payload["data"], list)
    assert payload["data"]


def test_get_trajectory_series() -> None:
    entity_id = _get_sample_entity_id()
    response = client.get(
        f"/api/v1/trajectory/{entity_id}",
        params={"max_points": 10},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["id"] == entity_id
    assert len(data["points"]) <= 10
    assert data["meta"]["totalPoints"] == len(data["points"])







