# Milestone 4 evidence — Built-in AI Employee Business Logic

Created with Codex (GPT-5.6) on 2026-07-17.

## Default workflows

- Recruiter: job/resumes → analysis → skills → 50% resume score → quiz → 50% quiz score → ranking → hiring report.
- Support: ticket → classification → mock knowledge lookup → response → escalation branch/human approval → resolution memory.
- Sales: lead → optional research → scoring → outreach → follow-up → mock CRM dashboard.
- Marketing: goal → audience → brief → multi-variant loop → content → calendar → projection.
- Operations: reports → KPIs → bottlenecks → improvements → executive summary/report.

`0004_business_workflows` seeds a separate published version plus independent editable draft and dataset for each built-in employee. Dataset scope is `employee_id`; run scope is also `employee_id`, preventing shared history, analytics, or memory contexts.

## Required validation run

After applying the migration and configuring Fireworks, run Recruiter, Support, and Sales from their published versions and inspect `GET /api/runs/{id}`. A live database/Fireworks validation could not be performed in this workspace because those services are not available.
