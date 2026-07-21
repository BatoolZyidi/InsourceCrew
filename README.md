# InsourceCrew

> Hire Your AI employees. Keep every workflow editable, versioned, and under your control.

InsourceCrew is a Work & Productivity platform for small and medium businesses. Instead of adopting a different tool for every function, a team hires an AI employee, reviews its workflow, uploads company data, and receives a role-specific business deliverable on screen.

The five built-in AI employees are Recruiter, Support, Sales, Marketing, and Operations. Every employee has an isolated workflow, execution history, and saved session output.

## What it does

- Creates an authenticated organization workspace with Owner, Manager, and Viewer roles.
- Provides five built-in AI employees with editable React Flow workflows.
- Stores separate Draft, Published, and Archived workflow versions.
- Runs Published workflows with uploaded CSV, JSON, or TXT inputs.
- Uses GPT-OSS through Fireworks only behind one isolated LLM client.
- Saves node-by-node execution logs and final deliverables per employee session.
- Renders role-specific outputs rather than raw JSON:
  - Recruiter: evidence, skills, scores, ranking, hiring actions.
  - Support: classification, guidance, draft response, confidence, escalation, resolution.
  - Sales: qualification, BANT, outreach, follow-up, CRM summary.
  - Marketing: audience, campaign brief, variants, calendar, projection.
  - Operations: KPIs, bottlenecks, action plan, executive report.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, React Flow |
| Backend | FastAPI, SQLAlchemy 2, Alembic, Pydantic |
| Database | PostgreSQL |
| Authentication | JWT access/refresh tokens, bcrypt hashing, auth rate limits |
| LLM runtime | Fireworks AI GPT-OSS (`accounts/fireworks/models/gpt-oss-120b`) |

## Project structure

```text
frontend/                         Next.js application
  app/employees/[id]/run/          Live employee test screen
  components/employees/            One output renderer per AI employee
  components/session-history.tsx   Shared saved-run history
backend/
  app/api/                         Routes only
  app/services/                    Business logic, planner, executor
  app/repositories/                Database access
  app/models/                      SQLAlchemy entities
  app/schemas/                     Pydantic contracts
  app/llm/                         The only Fireworks/GPT-OSS boundary
  alembic/                         PostgreSQL migrations
dummy_data/                        Local sample inputs for every role
docs/                              Architecture, workflow JSON, node registry
artifacts/                         Build-week implementation evidence
```

## Prerequisites

- Windows PowerShell (commands below are PowerShell)
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+ running locally
- Fireworks API key with access to GPT-OSS

## Installation

### 1. Create the database

Create a PostgreSQL database named `insourcecrew`.

```sql
CREATE DATABASE insourcecrew;
```

### 2. Configure the backend

```powershell
cd backend
Copy-Item .env.example .env
```

Set these values in `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/insourcecrew
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ACCESS_TOKEN_MINUTES=60
CORS_ORIGINS=http://127.0.0.1:3000,http://localhost:3000
LLM_PROVIDER=fireworks
FIREWORKS_API_KEY=your_fireworks_api_key
LLM_MODEL=accounts/fireworks/models/gpt-oss-120b
LLM_BASE_URL=https://api.fireworks.ai/inference/v1
```

Never commit `.env` or an API key. If a key is exposed, rotate it in Fireworks immediately.

### 3. Create the backend virtual environment

The current project uses `backend/.venv-local`.

```powershell
cd backend
py -3.12 -m venv .venv-local
.\.venv-local\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Apply migrations

```powershell
cd backend
.\.venv-local\Scripts\python.exe -m alembic upgrade head
```

### 5. Start the backend

```powershell
cd backend
.\.venv-local\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Verify:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8001/api/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8001/api/health/llm
```

API documentation: `http://127.0.0.1:8001/docs`

### 6. Configure and start the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

Then run:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Usage guide

### Start a workspace

1. Open the app and select **Create workspace**.
2. Register your organization, name, email, and password.
3. After login, choose one of the five AI employees from **Employees to hire**.

### Configure an employee

1. Open an employee workflow.
2. Inspect the Draft workflow in the React Flow canvas.
3. Edit nodes/configuration as needed.
4. Save the Draft.
5. Publish it when ready. Publishing archives the previous Published version and creates a new Draft copy.

### Run an employee with local sample data

Each role has supplied files under `dummy_data/`.

| Employee | Suggested sample |
| --- | --- |
| Recruiter | `dummy_data/recruiter/job_descriptions/jd_frontend_developer.json` plus files in `dummy_data/recruiter/resumes/` |
| Support | `dummy_data/support/ticket_4_feature_request.json` |
| Sales | `dummy_data/sales/lead_1_qualified_enterprise.json` |
| Marketing | `dummy_data/marketing/goal_1_increase_signups.json` |
| Operations | `dummy_data/operations/report_1_support_metrics_8weeks.csv` |

1. Open **My Crew** after publishing an employee.
2. Select **Run employee**.
3. Upload the role-relevant file. Recruiter requires a job description plus one or more resumes.
4. Select **Run**.
5. Review the processing steps and structured final deliverable.
6. Open **Session history** to revisit saved runs. The newest session opens by default.

### Workflow version control

- **Draft:** editable only; not used for runs.
- **Published:** current workflow used for execution.
- **Archived:** historical published version.

Use the version UI to compare, restore an older version to Draft, or delete an archived version.

## API overview

FastAPI interactive docs are available at `/docs`.

Common endpoints:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/employees
GET  /api/employees/{id}/workflow/draft
PUT  /api/employees/{id}/workflow/draft
POST /api/employees/{id}/workflow/publish
POST /api/employees/{id}/runs/upload
GET  /api/employees/{id}/runs
GET  /api/runs/{run_id}
GET  /api/health/llm
```

## Architecture and contracts

- [Architecture](docs/architecture.md)
- [Workflow JSON schema](docs/workflow-json.md)
- [Node Registry](docs/node-registry.md)
- [Final verification evidence](artifacts/final-verification.md)

The Planner only generates and validates Draft workflows. The Execution Engine only runs Published workflows in topological order. It never asks the Planner what to execute next.

## How Codex and GPT-5.6 were used

InsourceCrew was built iteratively with Codex using GPT-5.6 during OpenAI Build Week. Codex accelerated implementation across the monorepo, including:

- Designing the FastAPI clean-architecture layers and PostgreSQL workflow model.
- Building the Next.js dashboard, workflow editor, employee run screens, and session history.
- Implementing output contracts and role-specific renderers for the five AI employees.
- Debugging frontend/backend connectivity, CORS, generated Next.js cache issues, and typed API integration.
- Creating and validating dummy input datasets, execution logs, and final verification evidence.
- Running local build checks and authenticated workflow execution tests.

GPT-5.6/Codex is the development collaborator. GPT-OSS via Fireworks is the runtime model used by the AI employees. This separation is intentional: the product can swap its runtime LLM provider through a single `LLM_PROVIDER` configuration boundary.

## Build Week submission checklist

- [ ] Rotate any exposed Fireworks key and update `backend/.env`.
- [ ] Run the complete browser demo once after starting both services.
- [ ] Record a public video under three minutes showing the product working.
- [ ] Explain in the video how Codex and GPT-5.6 accelerated the build.
- [ ] Push this project to a public repository, or share a private repository with `testing@devpost.com` and `build-week-event@openai.com`.
- [ ] Include the Codex `/feedback` session ID requested by the Devpost form.

## Troubleshooting

- **Failed to fetch:** confirm backend health on port `8001` and `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001`; restart the frontend after changing `.env.local`.
- **Missing required error components / unstyled UI:** stop the frontend, remove only `frontend/.next`, then run `npm run dev` again.
- **LLM health fails:** verify your Fireworks key, internet connection, model access, and `LLM_BASE_URL`.
- **Database authentication fails:** correct the PostgreSQL password inside `DATABASE_URL`; URL-encode reserved password characters.
- **Port already in use:** stop the process using port `8001` or `3000`, then restart the relevant service.
