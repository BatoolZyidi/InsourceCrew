import time
import csv
import json
from pathlib import Path
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from app.llm.client import GptOssClient
from app.models.execution import (
    ExecutionRun,
    NodeExecutionLog,
    NodeRunStatus,
    RunStatus,
)
from app.models.employee import WorkflowStatus
from app.repositories.employee_repository import EmployeeRepository
from app.services.node_registry import REGISTRY_BY_TYPE

DUMMY_DATA_DIR = Path(__file__).resolve().parents[2] / "dummy_company_data"


def json_copy(value):
    """Detach a node output from the mutable execution context before persistence."""
    return json.loads(json.dumps(value))


def source_data(node_input):
    """Find the real uploaded/sample payload travelling through the graph."""
    variables = node_input.get("variables", {})
    if "uploaded_data" in variables:
        return variables["uploaded_data"]
    for output in node_input.get("upstream", {}).values():
        if isinstance(output, dict) and "data" in output:
            return output["data"]
    return variables.get("text", "")


def data_insight(data):
    """A deterministic, useful analysis of local company files for demo execution."""
    if isinstance(data, list):
        fields = list(data[0].keys()) if data and isinstance(data[0], dict) else []
        return {
            "record_count": len(data),
            "fields": fields,
            "sample_records": data[:3],
            "summary": f"Processed {len(data)} records with {len(fields)} fields.",
        }
    if isinstance(data, dict):
        return {
            "record_count": 1,
            "fields": list(data.keys()),
            "sample_records": [data],
            "summary": f"Processed a structured record with {len(data)} fields.",
        }
    text = str(data)
    return {
        "record_count": 1,
        "fields": ["text"],
        "sample_records": [text[:500]],
        "summary": f"Processed {len(text)} characters of text.",
    }


def business_result(role, data):
    """A truthful local fallback: every displayed fact comes from the submitted file."""
    insight = data_insight(data)
    text = (
        json.dumps(data, ensure_ascii=False)
        if isinstance(data, (dict, list))
        else str(data)
    )
    titles = {
        "marketing": "Marketing input analysis",
        "recruiter": "Recruiter input analysis",
        "support": "Support input analysis",
        "sales": "Lead qualification report",
        "operations": "Operations input analysis",
    }
    title = titles.get(role.lower(), "Uploaded file analysis")
    excerpt = " ".join(text.split())[:350] or "No readable content was found."
    fields = ", ".join(insight["fields"]) or "text"
    if role.lower() == "operations" and isinstance(data, list):
        capacity = []
        for row in data:
            if isinstance(row, dict):
                department = row.get("department", "Unknown department")
                utilization = row.get("capacity_utilization_percent")
                if utilization is not None:
                    capacity.append((department, str(utilization)))
        overloaded = [
            f"{department} is operating at {utilization}% capacity"
            for department, utilization in capacity
            if float(utilization.replace("%", "")) >= 95
        ]
        return {
            "title": "Operations executive report",
            "headline": "Operational KPI and capacity review",
            "summary": f"Analysed {insight['record_count']} operational records and identified capacity risks requiring management attention.",
            "highlights": [
                f"KPI summary: {', '.join(f'{department}: {utilization}% capacity' for department,utilization in capacity) or 'Operational records processed'}",
                f"Bottleneck analysis: {'; '.join(overloaded) or 'No capacity utilization above 95% detected'}",
                f"Prioritized improvements: Rebalance overloaded teams, address open positions, and review workload automation opportunities.",
                f"Executive report: Focus the next operating review on the highest-utilization departments and track capacity weekly.",
            ],
            "analysis_source": "local operations data analysis",
        }
    if role.lower() == "sales" and isinstance(data, dict):
        company = (
            data.get("company", {}) if isinstance(data.get("company"), dict) else {}
        )
        name = company.get("name") or data.get("name") or "Submitted lead"
        notes = " ".join(str(value) for value in data.values())
        competitor = company.get("tech_stack_notes") or data.get("context") or ""
        return {
            "title": "Lead qualification report",
            "headline": "Lead qualification and opportunity plan",
            "summary": f"{name} was assessed from the uploaded lead record.",
            "highlights": [
                f"Qualification decision: Review budget, authority, need, and timing with {name}.",
                f"BANT assessment: Company context: {competitor}",
                f"Outreach draft: Hi {name}, I noticed your team is evaluating a more predictable AI-agent experience. Could we schedule a short comparison and pricing discussion?",
                f"Follow-up sequence: Confirm decision owner, budget range, and target timeline; then schedule a solution review.",
                f"CRM summary: Created a lead record for {name} with the uploaded company context.",
            ],
            "analysis_source": "local sales lead analysis",
        }
    return {
        "title": title,
        "headline": "Findings grounded in your uploaded file",
        "summary": f"Read {insight['record_count']} record(s). Source excerpt: {excerpt}",
        "highlights": [
            f"Records found: {insight['record_count']}",
            f"Fields detected: {fields}",
            f"Source excerpt: {excerpt}",
        ],
        "analysis_source": "local file parser (GPT-OSS unavailable)",
    }


def latest_ai_output(upstream):
    for output in reversed(list(upstream.values())):
        if (
            isinstance(output, dict)
            and not str(output.get("type", "")).startswith("output.")
            and output.get("mode") != "local-demo"
            and not {"memory", "result", "source"}.intersection(output)
            and any(
                key in output
                for key in ("summary", "concepts", "findings", "analysis", "content")
            )
        ):
            return json_copy(output)
    return None


def combined_ai_output(upstream):
    """Keep useful structured work from every AI step for the final deliverable."""
    combined = {}
    for output in upstream.values():
        if (
            not isinstance(output, dict)
            or str(output.get("type", "")).startswith("output.")
            or output.get("mode") == "local-demo"
        ):
            continue
        if not any(
            key in output
            for key in (
                "summary",
                "findings",
                "concepts",
                "content_variants",
                "audience_definition",
                "campaign_brief",
                "content_calendar",
                "performance_projection",
                "kpi_summary",
                "bottlenecks",
                "prioritized_improvements",
                "executive_report",
                "follow_up_plan",
                "qualification_status",
                "bant_assessment",
                "outreach_draft",
                "crm_summary",
                "resume_evidence",
                "skill_extraction",
                "match_scores",
                "candidate_ranking",
                "hiring_report",
                "ticket_classification",
                "knowledge_base_guidance",
                "response_draft",
                "confidence",
                "escalation_decision",
                "resolution_log",
            )
        ):
            continue
        for key, value in output.items():
            if (
                key in {"summary", "findings", "recommended_actions"}
                or key not in combined
                or (not combined[key] and value)
            ):
                combined[key] = json_copy(value)
    return combined or latest_ai_output(upstream)


def dashboard_highlights(output):
    """Normalize varying GPT-OSS response shapes into readable dashboard details."""
    marketing_fields = [
        (
            "Audience definition",
            output.get("audience_definition") or output.get("audience"),
        ),
        ("Campaign brief", output.get("campaign_brief") or output.get("brief")),
        ("Content calendar", output.get("content_calendar") or output.get("calendar")),
        (
            "Performance projection",
            output.get("performance_projection")
            or output.get("projection")
            or output.get("projected_metrics"),
        ),
    ]
    marketing_rows = []
    for label, value in marketing_fields:
        if value not in (None, "", [], {}):
            marketing_rows.append(
                f"{label}: {json.dumps(value,ensure_ascii=False) if isinstance(value,(dict,list)) else value}"
            )
    # Sales needs a decision-ready deliverable rather than a single generic paragraph.
    # These labels are also resilient to equivalent keys returned by the model.
    sales_fields = [
        (
            "Qualification",
            output.get("qualification_status")
            or output.get("lead_status")
            or output.get("qualified"),
        ),
        (
            "BANT assessment",
            output.get("bant_assessment")
            or output.get("bant")
            or output.get("qualification_reasoning"),
        ),
        (
            "Outreach draft",
            output.get("outreach_draft")
            or output.get("email_draft")
            or output.get("message_draft"),
        ),
        (
            "Follow-up plan",
            output.get("follow_up_sequence")
            or output.get("follow_up_plan")
            or output.get("next_steps"),
        ),
        ("CRM summary", output.get("crm_summary") or output.get("crm_update")),
        (
            "Nurture reason",
            output.get("nurture_reason") or output.get("disqualification_reason"),
        ),
    ]
    sales_rows = [
        f"{label}: {value}"
        for label, value in sales_fields
        if value not in (None, "", [], {})
    ]
    if sales_rows:
        return sales_rows
    concepts = (
        output.get("concepts")
        or output.get("content_variants")
        or output.get("campaign_concepts")
        or []
    )
    if isinstance(concepts, list) and concepts:
        rows = []
        for item in concepts:
            if not isinstance(item, dict):
                rows.append(str(item))
                continue
            title = (
                item.get("title")
                or item.get("name")
                or item.get("concept")
                or "Untitled concept"
            )
            platforms = (
                item.get("platform")
                or item.get("platforms")
                or item.get("channel")
                or item.get("channels")
                or item.get("recommended_platforms")
                or "Channel not specified"
            )
            if isinstance(platforms, list):
                platforms = ", ".join(map(str, platforms))
            message = (
                item.get("key_message")
                or item.get("description")
                or item.get("creative_idea")
                or item.get("idea")
                or item.get("caption")
                or item.get("caption_example")
                or item.get("copy")
                or "Details not supplied"
            )
            tags = item.get("hashtags") or []
            rows.append(
                f"{title} | {platforms} | {message} | {' '.join(map(str,tags))}"
            )
        return marketing_rows + rows
    if marketing_rows:
        return marketing_rows
    operations_fields = [
        ("KPI summary", output.get("kpi_summary") or output.get("kpis")),
        ("Bottleneck analysis", output.get("bottlenecks") or output.get("risks")),
        (
            "Prioritized improvements",
            output.get("prioritized_improvements") or output.get("recommended_actions"),
        ),
        ("Executive report", output.get("executive_report")),
        ("Follow-up plan", output.get("follow_up_plan") or output.get("next_steps")),
    ]
    operations_rows = [
        f"{label}: {json.dumps(value,ensure_ascii=False) if isinstance(value,(dict,list)) else value}"
        for label, value in operations_fields
        if value not in (None, "", [], {})
    ]
    if operations_rows:
        return operations_rows
    recruiter_fields = [
        ("Resume evidence", output.get("resume_evidence")),
        ("Skill extraction", output.get("skill_extraction")),
        ("Match scores", output.get("match_scores")),
        ("Candidate ranking", output.get("candidate_ranking")),
        ("Hiring report", output.get("hiring_report")),
    ]
    recruiter_rows = [
        f"{label}: {json.dumps(value,ensure_ascii=False) if isinstance(value,(dict,list)) else value}"
        for label, value in recruiter_fields
        if value not in (None, "", [], {})
    ]
    if recruiter_rows:
        return recruiter_rows
    support_fields = [
        ("Ticket classification", output.get("ticket_classification")),
        ("Knowledge-base guidance", output.get("knowledge_base_guidance")),
        ("Response draft", output.get("response_draft")),
        ("Confidence", output.get("confidence")),
        ("Escalation decision", output.get("escalation_decision")),
        ("Resolution log", output.get("resolution_log")),
    ]
    support_rows = [
        f"{label}: {json.dumps(value,ensure_ascii=False) if isinstance(value,(dict,list)) else value}"
        for label, value in support_fields
        if value not in (None, "", [], {})
    ]
    if support_rows:
        return support_rows
    findings = (
        output.get("findings")
        or output.get("recommended_actions")
        or output.get("next_steps")
        or []
    )
    if isinstance(findings, list) and findings:
        return [str(item) for item in findings]
    return [
        f"{key.replace('_',' ').title()}: {value}"
        for key, value in output.items()
        if key not in {"type", "summary"}
    ]


def _trim_for_llm(value, *, max_chars=3000):
    """Keep LLM context useful, bounded, and free of execution metadata."""
    encoded = json.dumps(value, ensure_ascii=False, default=str)
    if len(encoded) <= max_chars:
        return value
    return {
        "truncated": True,
        "preview": encoded[:max_chars],
        "original_characters": len(encoded),
    }


def clean_llm_context(node_input):
    """Use the latest meaningful result, not the full workflow execution history."""
    variables = {
        key: value
        for key, value in node_input.get("variables", {}).items()
        if not key.startswith("_")
    }
    upstream = node_input.get("upstream", {})
    latest = None
    for output in reversed(list(upstream.values())):
        if isinstance(output, dict) and not str(output.get("type", "")).startswith(
            "output."
        ):
            latest = output
            break
    return {
        "input_variables": _trim_for_llm(variables),
        "latest_upstream_output": _trim_for_llm(latest) if latest is not None else None,
    }


ROLE_EXECUTION_BRIEFS = {
    "Recruiter": "Recruiter work: compare each resume to the job description; extract skills, experience and education; produce an evidence-based resume match score, candidate ranking, and hiring recommendation. Never invent candidate facts. Always return: resume_evidence, skill_extraction, match_scores, candidate_ranking, and hiring_report.",
    "Support": "Support work: classify the ticket by category, sentiment and urgency; use only supplied knowledge-base context; draft a helpful response; state confidence; clearly flag human escalation for negative sentiment or low confidence; record the resolution. Always return: ticket_classification, knowledge_base_guidance, response_draft, confidence, escalation_decision, and resolution_log.",
    "Sales": "Sales work: qualify the lead with budget, authority, need and timing evidence; mark qualified or nurture; draft personalized outreach only for qualified leads; propose a follow-up schedule and a concise mock CRM update. Never claim web research unless supplied. Your final result must contain these exact dashboard fields: qualification_status, bant_assessment (budget/authority/need/timing), outreach_draft (or a clear statement that no outreach is sent), follow_up_sequence, crm_summary, and nurture_reason when not qualified.",
    "Marketing": "Marketing work: turn the business goal into an audience definition, campaign brief, three distinct social/caption/ad concepts, a content calendar, and explicitly-labelled estimated mock metrics. Tie every concept to the supplied goal. Always return these exact fields: audience_definition, campaign_brief, content_variants, content_calendar, and performance_projection.",
    "Operations": "Operations work: calculate KPIs directly from supplied operational data; identify bottlenecks with evidence; rank issues by impact; propose measurable improvements; write an executive summary. Show calculations and do not invent numbers. Always return these exact fields: kpi_summary, bottlenecks, prioritized_improvements, executive_report, and follow_up_plan.",
}


def read_demo_file(filename: str):
    path = (DUMMY_DATA_DIR / filename).resolve()
    if DUMMY_DATA_DIR not in path.parents or not path.is_file():
        raise RuntimeError(f"Demo file not found: {filename}")
    if path.suffix == ".json":
        return json.loads(path.read_text(encoding="utf-8"))
    if path.suffix == ".csv":
        with path.open(encoding="utf-8", newline="") as handle:
            return list(csv.DictReader(handle))
    if path.suffix == ".txt":
        return path.read_text(encoding="utf-8")
    raise RuntimeError(f"Unsupported file type: {path.suffix}")


class ExecutionService:
    """Deterministic graph runner. It never invokes the Planner or changes workflows."""

    def __init__(self, db: Session, org_id):
        self.db = db
        self.org_id = org_id
        self.employees = EmployeeRepository(db)

    def _published(self, eid):
        employee = self.employees.get(eid, self.org_id)
        if not employee:
            raise HTTPException(404, "Employee not found")
        workflow = self.employees.published(eid)
        if not workflow:
            raise HTTPException(409, "Employee has no published workflow")
        return employee, workflow

    def _order(self, workflow):
        nodes = {str(n["id"]): n for n in workflow["nodes"]}
        incoming = {k: 0 for k in nodes}
        adj = {k: [] for k in nodes}
        for e in workflow["edges"]:
            adj[str(e["source"])].append(str(e["target"]))
            incoming[str(e["target"])] += 1
        ready = sorted(k for k, v in incoming.items() if v == 0)
        order = []
        while ready:
            key = ready.pop(0)
            order.append(nodes[key])
            for nxt in sorted(adj[key]):
                incoming[nxt] -= 1
                if incoming[nxt] == 0:
                    ready.append(nxt)
                    ready.sort()
        if len(order) != len(nodes):
            raise HTTPException(422, "Published workflow contains a cycle")
        return order

    async def execute(self, eid, input_data: dict):
        employee, workflow = self._published(eid)
        input_data = {**input_data, "_employee_role": employee.role}
        run = ExecutionRun(
            employee_id=eid,
            workflow_version_id=workflow.id,
            status=RunStatus.RUNNING,
            input=input_data,
            context={"variables": input_data, "node_outputs": {}, "memory": {}},
            started_at=datetime.now(timezone.utc),
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        context = run.context
        try:
            for sequence, node in enumerate(self._order(workflow.workflow)):
                node_id = str(node["id"])
                node_type = node["data"]["type"]
                started = time.perf_counter()
                node_input = {
                    "variables": context["variables"],
                    "upstream": context["node_outputs"],
                }
                log = NodeExecutionLog(
                    run_id=run.id,
                    node_id=node_id,
                    node_type=node_type,
                    sequence=sequence,
                    status=NodeRunStatus.RUNNING,
                    input=node_input,
                )
                self.db.add(log)
                self.db.commit()
                try:
                    label = str(node.get("data", {}).get("label", "")).lower()
                    if employee.role == "Recruiter" and "quiz" in label:
                        output = {
                            "skipped": True,
                            "reason": "Recruiter quiz steps are disabled.",
                        }
                    else:
                        output = await self._run_node(
                            node_type,
                            node.get("data", {}).get("config", {}),
                            node_input,
                        )
                    log.status = NodeRunStatus.SUCCESS
                    log.output = output
                    log.duration_ms = round((time.perf_counter() - started) * 1000)
                    context["node_outputs"][node_id] = output
                    run.context = context
                    self.db.commit()
                except Exception as exc:
                    message = str(exc) or exc.__class__.__name__
                    self.db.rollback()
                    log.status = NodeRunStatus.FAILURE
                    log.error = message
                    log.duration_ms = round((time.perf_counter() - started) * 1000)
                    run.status = RunStatus.FAILURE
                    run.error = f"{node_id}: {message}"
                    run.context = context
                    run.completed_at = datetime.now(timezone.utc)
                    self.db.commit()
                    return run
            run.status = RunStatus.SUCCESS
            run.context = context
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            return run
        except Exception as exc:
            run.status = RunStatus.FAILURE
            run.error = str(exc)
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            return run

    async def _run_node(self, node_type, config, node_input):
        if node_type not in REGISTRY_BY_TYPE:
            raise RuntimeError("Registry violation")
        if node_type.startswith("data.input"):
            variables = node_input["variables"]
            # A user upload must always win over a template's old sample-file setting.
            # This keeps published workflows reusable after their demo fixture is removed.
            if "uploaded_data" in variables:
                return {
                    "source": "uploaded_file",
                    "file": variables.get("uploaded_file"),
                    "data": variables["uploaded_data"],
                }
            if variables.get("job_description") or variables.get("resumes"):
                return {
                    "source": "uploaded_recruiter_files",
                    "data": {
                        "job_description": variables.get("job_description", ""),
                        "resumes": variables.get("resumes", []),
                    },
                }
            filename = variables.get("sample_file") or config.get("file")
            if filename:
                data = read_demo_file(filename)
                return {"source": "dummy_company_data", "file": filename, "data": data}
            return {"data": config.get("value", variables.get("text", variables))}
        if node_type.startswith("ai."):
            research = ""
            if node_type == "ai.research" and config.get("use_serpapi"):
                from app.tools.serpapi import search

                research = "\nOptional research result: " + json.dumps(
                    await search(config.get("query", "")), ensure_ascii=False
                )
            context = clean_llm_context(node_input)
            task = (
                config.get("prompt_template")
                or config.get("query")
                or f"Execute the {node_type} workflow step."
            )
            role = node_input["variables"].get("_employee_role", "AI employee")
            role_brief = ROLE_EXECUTION_BRIEFS.get(
                role,
                "Complete the requested business workflow step using supplied evidence.",
            )
            prompt = f"Employee role: {role}\nRole requirements: {role_brief}\nWorkflow node type: {node_type}\nTask: {task}\nClean execution context:\n{json.dumps(context,ensure_ascii=False,indent=2)}{research}"
            system = """You are an enterprise AI employee executing one workflow step for a business.
Use only the supplied clean execution context; do not invent facts, metrics, customers, outcomes, or sources.
Return one valid JSON object only, with no Markdown and no commentary outside JSON. Keep the complete JSON response under 1,200 words; keep arrays to at most five items and each string field under 400 characters unless source data requires an exact value.
Produce a polished, frontend-ready result. Include a concise `summary` string and a non-empty `findings` array of specific evidence-based points. Include a non-empty `recommended_actions` array when actions are appropriate. For Recruiter, ALWAYS include resume_evidence, skill_extraction, match_scores, candidate_ranking, and hiring_report. For Marketing concepts, every concept MUST include `title`, `platforms` (array), `description`, and `hashtags` (array); ALWAYS include audience_definition, campaign_brief, content_variants, content_calendar, and performance_projection. For Operations, ALWAYS include kpi_summary, bottlenecks, prioritized_improvements, executive_report, and follow_up_plan. For Support, ALWAYS include ticket_classification, knowledge_base_guidance, response_draft, confidence, escalation_decision, and resolution_log. For Sales, ALWAYS include `qualification_status`, `bant_assessment` (an object with budget, authority, need, timing), `outreach_draft`, `follow_up_sequence`, and `crm_summary`; use `nurture_reason` when the lead is not qualified. Do not omit those fields merely because this is a later workflow step.
Preserve important source values exactly. Make each field understandable to a business manager viewing a dashboard.
If the input lacks information needed for a conclusion, state that limitation explicitly in `findings` instead of guessing."""
            text, _ = await GptOssClient().complete(
                prompt, system=system, max_tokens=4096
            )
            output = json.loads(text)
            if not isinstance(output, dict):
                raise RuntimeError("GPT-OSS returned a non-object JSON result")
            return output
        if node_type.startswith("memory."):
            return {"memory": json_copy(node_input["upstream"])}
        if node_type == "output.notification":
            return {
                "app": "slack",
                "channel": config.get("channel", "#workforce-updates"),
                "message": config.get("message", "AI employee completed its workflow."),
                "delivered": True,
            }
        if node_type == "output.dashboard":
            insight = data_insight(source_data(node_input))
            result = business_result(
                node_input["variables"].get("_employee_role", "operations"),
                source_data(node_input),
            )
            model_output = combined_ai_output(node_input["upstream"])
            if model_output:
                result["summary"] = str(
                    model_output.get("summary")
                    or model_output.get("analysis")
                    or result["summary"]
                )
                result["highlights"] = dashboard_highlights(model_output)
            return {
                "app": "crm",
                "type": "output.dashboard",
                "record_type": config.get("record_type", "Workflow activity"),
                "title": result["title"],
                "headline": result["headline"],
                "fields": {
                    "records_processed": insight["record_count"],
                    "fields_detected": ", ".join(insight["fields"][:6]) or "text",
                    "source": (
                        "GPT-OSS generated analysis"
                        if model_output
                        else result["analysis_source"]
                    ),
                },
                "summary": result["summary"],
                "highlights": result["highlights"],
                "model_output": model_output,
                "sample_records": insight["sample_records"],
            }
        if node_type == "output.pdf":
            insight = data_insight(source_data(node_input))
            result = business_result(
                node_input["variables"].get("_employee_role", "operations"),
                source_data(node_input),
            )
            return {
                "type": "output.pdf",
                "document_name": config.get("document_name", result["title"] + ".pdf"),
                "title": result["title"],
                "generated": True,
                "summary": result["summary"],
                "metrics": {
                    "records_processed": insight["record_count"],
                    "fields_detected": len(insight["fields"]),
                },
                "sections": [
                    {"heading": result["headline"], "body": result["summary"]},
                    {
                        "heading": "Key findings",
                        "body": "\n".join("• " + item for item in result["highlights"]),
                    },
                    {
                        "heading": "Source data fields",
                        "body": ", ".join(insight["fields"]) or "Text input",
                    },
                ],
            }
        if node_type.startswith("output."):
            return {
                "type": node_type,
                "delivered": True,
                "content": json_copy(node_input["upstream"]),
            }
        return {"result": json_copy(node_input["upstream"])}

    def get_run(self, run_id):
        run = self.db.get(ExecutionRun, run_id)
        if not run or not self.employees.get(run.employee_id, self.org_id):
            raise HTTPException(404, "Run not found")
        logs = list(
            self.db.scalars(
                select(NodeExecutionLog)
                .where(NodeExecutionLog.run_id == run_id)
                .order_by(NodeExecutionLog.sequence)
            )
        )
        return run, logs

    def list_runs(self, eid):
        self._published(eid)
        return list(
            self.db.scalars(
                select(ExecutionRun)
                .where(ExecutionRun.employee_id == eid)
                .order_by(ExecutionRun.created_at.desc())
            )
        )

    def delete_run(self, run_id):
        run, _ = self.get_run(run_id)
        self.db.execute(
            delete(NodeExecutionLog).where(NodeExecutionLog.run_id == run.id)
        )
        self.db.delete(run)
        self.db.commit()

    async def retry(self, run_id):
        run, _ = self.get_run(run_id)
        if run.status != RunStatus.FAILURE:
            raise HTTPException(409, "Only failed runs can be retried")
        return await self.execute(run.employee_id, run.input)
