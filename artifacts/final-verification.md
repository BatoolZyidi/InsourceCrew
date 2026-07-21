# InsourceCrew final verification

Date: 2026-07-21

## Local services

- Backend health endpoint: `200 OK` at `http://127.0.0.1:8001/api/health`.
- Frontend production build: passed with `npm run build`.
- Frontend routes generated successfully, including the employee workflow and run pages.

## Fresh workflow execution evidence

An isolated local test organization was created and one supplied dummy input was executed for each role through the authenticated API.

- Recruiter: success; 5 structured deliverable fields.
- Support: success; 6 structured deliverable fields.
- Sales: success; 5 structured deliverable fields.
- Marketing: success; 7 structured deliverable fields.
- Operations: execution endpoint needs one follow-up retry in the browser because the separate shell multipart request did not return a run ID.

## Output contract

Frontend live output and session-history output use role-specific components for Recruiter, Support, Sales, Marketing, and Operations. The backend aggregates structured fields into the final dashboard output.

## Remaining manual check

Run one Operations CSV from the browser and confirm the latest session shows the KPI, bottleneck, improvements, and executive-report cards.
