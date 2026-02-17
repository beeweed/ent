import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
import json

from src.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_models_without_auth():
    response = client.get("/models")
    assert response.status_code == 401
    assert "Authorization header required" in response.json()["detail"]


def test_chat_without_auth():
    response = client.post(
        "/chat",
        json={"model": "test-model", "messages": [{"role": "user", "content": "Hello"}]}
    )
    assert response.status_code == 401
    assert "Authorization header required" in response.json()["detail"]


@pytest.mark.asyncio
async def test_models_with_auth():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": [
            {
                "id": "openai/gpt-4",
                "name": "GPT-4",
                "description": "OpenAI's most capable model",
                "context_length": 8192,
                "pricing": {"prompt": "0.00003", "completion": "0.00006"},
                "top_provider": {}
            }
        ]
    }
    
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        
        response = client.get(
            "/models",
            headers={"Authorization": "Bearer test-api-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert len(data["models"]) == 1
        assert data["models"][0]["id"] == "openai/gpt-4"


def test_chat_endpoint_structure():
    response = client.post(
        "/chat",
        headers={"Authorization": "Bearer test-api-key"},
        json={
            "model": "openai/gpt-4",
            "messages": [
                {"role": "user", "content": "Hello"}
            ]
        }
    )
    assert response.headers.get("content-type") == "text/event-stream; charset=utf-8"


def test_chat_request_validation():
    response = client.post(
        "/chat",
        headers={"Authorization": "Bearer test-api-key"},
        json={}
    )
    assert response.status_code == 422


def test_chat_with_invalid_messages():
    response = client.post(
        "/chat",
        headers={"Authorization": "Bearer test-api-key"},
        json={
            "model": "openai/gpt-4",
            "messages": [
                {"invalid_field": "test"}
            ]
        }
    )
    assert response.status_code == 422