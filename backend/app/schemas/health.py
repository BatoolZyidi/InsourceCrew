from pydantic import BaseModel


class LlmHealthResponse(BaseModel):
    provider: str
    model: str
    response: str
    latency_ms: int
