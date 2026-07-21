import time
import httpx
from app.core.config import get_settings


class GptOssClient:
    """The only permitted boundary for calls to an LLM provider."""

    async def trivial_prompt(self) -> tuple[str, int]:
        settings = get_settings()
        if settings.llm_provider != "fireworks":
            raise RuntimeError(f"Unsupported LLM_PROVIDER: {settings.llm_provider}")
        if not settings.fireworks_api_key:
            raise RuntimeError("FIREWORKS_API_KEY is not configured")
        started = time.perf_counter()
        async with httpx.AsyncClient(
            base_url=str(settings.llm_base_url), timeout=30
        ) as client:
            response = await client.post(
                "chat/completions",
                headers={"Authorization": f"Bearer {settings.fireworks_api_key}"},
                json={
                    "model": settings.llm_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": "Reply with exactly: InsourceCrew GPT-OSS connected",
                        }
                    ],
                    "temperature": 0,
                    "max_tokens": 20,
                },
            )
            response.raise_for_status()
        latency = round((time.perf_counter() - started) * 1000)
        message = response.json()["choices"][0]["message"]
        text = (
            message.get("content")
            or message.get("reasoning_content")
            or message.get("reasoning")
            or ""
        )
        if not text:
            raise RuntimeError("GPT-OSS returned no readable content")
        return text, latency

    async def complete(
        self, prompt: str, *, system: str = "", max_tokens: int = 4096
    ) -> tuple[str, int]:
        """Shared GPT-OSS boundary for Planner and AI execution nodes."""
        settings = get_settings()
        if settings.llm_provider != "fireworks" or not settings.fireworks_api_key:
            raise RuntimeError("GPT-OSS provider is not configured")
        messages = ([{"role": "system", "content": system}] if system else []) + [
            {"role": "user", "content": prompt}
        ]
        started = time.perf_counter()
        try:
            async with httpx.AsyncClient(
                base_url=str(settings.llm_base_url), timeout=90
            ) as client:
                response = await client.post(
                    "chat/completions",
                    headers={"Authorization": f"Bearer {settings.fireworks_api_key}"},
                    json={
                        "model": settings.llm_model,
                        "messages": messages,
                        "temperature": 0,
                        "max_tokens": max_tokens,
                        "response_format": {"type": "json_object"},
                    },
                )
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise RuntimeError(
                "GPT-OSS request timed out. Please retry this run."
            ) from exc
        except httpx.HTTPError as exc:
            raise RuntimeError(f"GPT-OSS request failed: {exc}") from exc
        message = response.json()["choices"][0]["message"]
        text = (
            message.get("content")
            or message.get("reasoning_content")
            or message.get("reasoning")
            or ""
        )
        if not text:
            raise RuntimeError("GPT-OSS returned no readable content")
        return text, round((time.perf_counter() - started) * 1000)
