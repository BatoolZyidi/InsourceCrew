# Milestone 3 evidence — InsourceCrew Intelligence Layer

Created with Codex (GPT-5.6) on 2026-07-17.

## Separation of responsibilities

- `PlannerService` receives an employee role/goal and the strict registry, calls GPT-OSS only through `llm/GptOssClient`, validates the graph, retries once with validation feedback, then writes only a Draft. It has no execution code.
- `ExecutionService` reads a Published version only, calculates deterministic lexical topological order, never imports/uses the Planner, and records the complete context plus each node log.

## Recruiter full-loop checklist

1. Log in as `maya.chen@acme.test` / `AcmeDemo!2026`.
2. Call `POST /api/employees/{recruiterId}/workflow/regenerate`, then publish the resulting Draft.
3. Call `POST /api/employees/{recruiterId}/runs` with `{"input":{"text":"Candidate: Ada, 5 years recruiting experience"}}`.
4. Poll `GET /api/runs/{runId}` for node-by-node status, inputs, outputs, duration, and error details.

Retry a failed run with `POST /api/runs/{runId}/retry`; it reuses the recorded deterministic input and published workflow.

The run requires `FIREWORKS_API_KEY` to execute AI nodes. The optional SerpAPI integration is feature-flagged through `SERPAPI_ENABLED=false` by default, so it is safe without credentials.

## Migration

```powershell
cd backend
alembic upgrade head
```
