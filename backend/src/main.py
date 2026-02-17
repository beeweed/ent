from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import httpx
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: List[Message]


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/models")
async def get_models(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    api_key = authorization.replace("Bearer ", "")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                f"{OPENROUTER_BASE_URL}/models",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "AI Chatbot"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenRouter API error: {response.text}"
                )
            
            data = response.json()
            models = data.get("data", [])
            
            formatted_models = []
            for model in models:
                formatted_models.append({
                    "id": model.get("id"),
                    "name": model.get("name", model.get("id")),
                    "description": model.get("description", ""),
                    "context_length": model.get("context_length", 0),
                    "pricing": model.get("pricing", {}),
                    "top_provider": model.get("top_provider", {})
                })
            
            return {"models": formatted_models}
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")


@app.post("/chat")
async def chat(request: ChatRequest, authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    api_key = authorization.replace("Bearer ", "")
    
    async def generate():
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                messages = [{"role": m.role, "content": m.content} for m in request.messages]
                
                async with client.stream(
                    "POST",
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "AI Chatbot",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": request.model,
                        "messages": messages,
                        "stream": True
                    }
                ) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        yield f"data: {json.dumps({'error': error_body.decode()})}\n\n"
                        return
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            yield f"{line}\n\n"
                        elif line.strip():
                            yield f"data: {line}\n\n"
                            
            except httpx.RequestError as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )