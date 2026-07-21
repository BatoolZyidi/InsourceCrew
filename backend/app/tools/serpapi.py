import httpx
from app.core.config import get_settings


async def search(query: str) -> dict:
    """Optional, disabled-by-default research tool; no LLM calls occur here."""
    settings = get_settings()
    if not settings.serpapi_enabled or not settings.serpapi_api_key:
        return {"enabled": False, "results": []}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            "https://serpapi.com/search.json",
            params={
                "q": query,
                "api_key": settings.serpapi_api_key,
                "engine": "google",
            },
        )
        response.raise_for_status()
    payload = response.json()
    return {
        "enabled": True,
        "results": [
            {
                "title": r.get("title"),
                "link": r.get("link"),
                "snippet": r.get("snippet"),
            }
            for r in payload.get("organic_results", [])[:5]
        ],
    }
