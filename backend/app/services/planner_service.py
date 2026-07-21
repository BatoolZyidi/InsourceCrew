import json
from app.llm.client import GptOssClient
from app.schemas.employee import WorkflowGraph
from app.services.node_registry import NODE_REGISTRY
from app.services.workflow_service import EmployeeService
from app.services.business_workflows import FALLBACK_WORKFLOWS

KNOWN_GOOD = FALLBACK_WORKFLOWS


class PlannerService:
    """Generates only drafts. It never executes a graph."""

    def __init__(self, employee_service: EmployeeService):
        self.employees = employee_service

    async def generate_draft(self, employee_id, goal_override: str | None = None):
        employee = self.employees._employee(employee_id)
        goal = goal_override or employee.goal
        prompt = f"Create a JSON workflow with nodes and edges for role={employee.role}, goal={goal}. Use only this registry: {json.dumps(NODE_REGISTRY)}. Each node must have id, position, and data(type,label,config). Return JSON only."
        error = ""
        for _ in range(2):
            text, _ = await GptOssClient().complete(
                prompt + (f" Previous validation error: {error}" if error else ""),
                system="You are the InsourceCrew Planner. You plan only; never execute.",
            )
            try:
                graph = WorkflowGraph.model_validate(json.loads(text))
                self.employees._validate(graph)
                return self.employees.save_draft(employee_id, graph)
            except Exception as exc:
                error = str(exc)
        fallback = KNOWN_GOOD.get(employee.role, {"nodes": [], "edges": []})
        graph = WorkflowGraph.model_validate(fallback)
        return self.employees.save_draft(employee_id, graph)
