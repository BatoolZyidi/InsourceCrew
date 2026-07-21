# Milestone 2 evidence — InsourceCrew Employee System

Created with Codex (GPT-5.6) on 2026-07-17.

## Delivered

- Employee CRUD, archive/activate/deactivate, and duplication, isolated by organization.
- PostgreSQL-backed employee workflows stored as JSON, with a single editable Draft, Published runtime version, and immutable archived versions.
- Publishing archives the former published version and creates the next independent Draft. Restore copies history into Draft without modifying history.
- Strict backend node registry and graph validation: registry-only types, no dangling edges, cycles, or unconnected required-input nodes.
- Built-in Acme employee shells: Recruiter, Sales, Marketing, Support, Operations.
- React Flow builder UI with palette, canvas connections, move/delete, side-panel rename/configuration, reset/save/publish controls, and version history UI.

## API highlights

- `GET /api/node-registry`
- `GET|POST /api/employees`, `PATCH /api/employees/{id}`
- `POST /api/employees/{id}/{archive|activate|deactivate|duplicate}`
- `GET|PUT /api/employees/{id}/workflow/draft`
- `POST /api/employees/{id}/workflow/{publish|reset}`
- `GET /api/employees/{id}/workflow/versions`
- `GET /api/employees/{id}/workflow/compare?left=1&right=2`
- `POST /api/employees/{id}/workflow/restore/{version}`

## Apply database changes

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
alembic upgrade head
```
