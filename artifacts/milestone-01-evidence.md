# Milestone 1 evidence — InsourceCrew

Created with Codex (GPT-5.6) on 2026-07-17.

## Delivered

- Clean Architecture FastAPI backend with PostgreSQL, SQLAlchemy 2, Alembic, Pydantic validation, bcrypt/JWT auth, refresh-token rotation, roles, and auth rate limiting.
- Next.js 15 TypeScript dashboard shell with sidebar, top nav, responsive stat cards, and empty recent-activity state.
- Alembic seed migration for Acme Technologies, five departments, and three realistic role-based users.
- Isolated GPT-OSS Fireworks client and `GET /api/health/llm`, returning the provider response and measured latency.

## Verification commands

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
alembic upgrade head
python -m app.scripts.seed
uvicorn app.main:app --reload
```

Then open `http://localhost:8000/docs` and `http://localhost:3000` after starting the frontend. Configure provider credentials before calling `/api/health/llm`.

## Verification result

- `python -m compileall app` completed successfully using `backend/.venv`.
- Dependency installation/test execution awaits successful package-registry access in this environment.
