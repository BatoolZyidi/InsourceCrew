# InsourceCrew architecture

The monorepo is split into `frontend/` and `backend/`. Backend dependencies flow inward: API routes delegate to services, services use repositories, and repositories are the only layer that accesses SQLAlchemy sessions. LLM calls are permitted only through `app.llm.GptOssClient`.

## Integration-ready boundaries

`core.config.Settings` exposes a single `LLM_PROVIDER` setting and provider endpoint/model settings. Future company-account connectors should live behind service interfaces and encrypted credential repositories; no UI or workflow code depends on a vendor directly.

## Authentication

Passwords are bcrypt-hashed. Short-lived JWT access tokens and rotating refresh tokens are returned on login; refresh token fingerprints are stored in PostgreSQL. Auth endpoints are IP rate-limited using SlowAPI. Production requires a long random `JWT_SECRET_KEY`, secure cookies if cookie transport is added, HTTPS, and a shared rate-limit store.
