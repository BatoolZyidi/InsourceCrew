# InsourceCrew on Supabase

InsourceCrew uses SQLAlchemy and PostgreSQL. Supabase is managed PostgreSQL, so
the existing models, repositories, Alembic migrations, and FastAPI API remain
unchanged.

## Required connection

In the Supabase project dashboard, select **Connect** and copy the **Session
Pooler** connection string. This is the recommended option for local Windows
development and a future Render deployment because it works on IPv4 networks.

Set it in `backend/.env` as `DATABASE_URL`, using SQLAlchemy's psycopg driver:

```env
DATABASE_URL=postgresql+psycopg://postgres.PROJECT_REF:YOUR_DATABASE_PASSWORD@aws-REGION.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_JWKS_URL=https://YOUR_PROJECT.supabase.co/auth/v1/.well-known/jwks.json
```

Do not commit the database password or Supabase secret key. The current
InsourceCrew JWT authentication remains the authentication source until a
deliberate migration to Supabase Auth is approved.

## Move the schema

After setting `DATABASE_URL`, activate the backend environment and run:

```powershell
cd backend
.\.venv-local\Scripts\Activate.ps1
alembic upgrade head
```

Then start the backend and use **Load Demo Data** or create a workspace from the
signup page. This creates InsourceCrew organizations, users, employees,
workflows, versions, and execution history in Supabase.

## Render deployment

Configure the same `DATABASE_URL` and application secrets in Render's backend
environment variables. Set `CORS_ORIGINS` to the deployed frontend URL.
