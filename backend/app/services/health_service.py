from app.core.config import get_settings
from app.llm.client import GptOssClient
from app.schemas.health import LlmHealthResponse


class HealthService:
    async def llm_health(self) -> LlmHealthResponse:
        response, latency = await GptOssClient().trivial_prompt()
        settings = get_settings()
        return LlmHealthResponse(
            provider=settings.llm_provider,
            model=settings.llm_model,
            response=response,
            latency_ms=latency,
        )
