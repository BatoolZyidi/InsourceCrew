from fastapi import APIRouter, HTTPException
from app.schemas.health import LlmHealthResponse
from app.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", summary="API health")
def health():
    return {"status": "ok"}


@router.get("/llm", response_model=LlmHealthResponse)
async def llm_health():
    try:
        return await HealthService().llm_health()
    except Exception as exc:
        raise HTTPException(503, f"LLM connectivity check failed: {exc}") from exc
