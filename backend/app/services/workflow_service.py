from copy import deepcopy
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.employee import (
    Employee,
    EmployeeStatus,
    WorkflowStatus,
    WorkflowVersion,
)
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    VersionDiff,
    WorkflowGraph,
)
from app.services.node_registry import REGISTRY_BY_TYPE
from app.services.business_workflows import FALLBACK_WORKFLOWS

EMPTY = {"nodes": [], "edges": []}
BUILTIN_DEPARTMENTS = {
    "Recruiter": "HR",
    "Support": "Support",
    "Sales": "Sales",
    "Marketing": "Marketing",
    "Operations": "Operations",
}


def provision_builtin_employees(db: Session, organization_id) -> list[Employee]:
    """Give every organization its own isolated five-employee workforce."""
    repo = EmployeeRepository(db)
    existing = {item.role for item in repo.list(organization_id)}
    created = []
    for role, department in BUILTIN_DEPARTMENTS.items():
        if role in existing:
            continue
        employee = repo.add(
            Employee(
                organization_id=organization_id,
                name=role,
                role=role,
                department=department,
                description=f"Built-in {role} AI employee",
                goal=f"Run the {role} default workflow",
                status=EmployeeStatus.ACTIVE,
            )
        )
        graph = deepcopy(FALLBACK_WORKFLOWS[role])
        payload = {"nodes": graph["nodes"], "edges": graph["edges"]}
        repo.add(
            WorkflowVersion(
                employee_id=employee.id,
                version=1,
                status=WorkflowStatus.PUBLISHED,
                workflow=payload,
            )
        )
        repo.add(
            WorkflowVersion(
                employee_id=employee.id,
                version=2,
                status=WorkflowStatus.DRAFT,
                workflow=deepcopy(payload),
            )
        )
        created.append(employee)
    return created


class EmployeeService:
    def __init__(self, db: Session, org_id):
        self.db = db
        self.org_id = org_id
        self.repo = EmployeeRepository(db)

    def _employee(self, eid):
        item = self.repo.get(eid, self.org_id)
        if not item:
            raise HTTPException(404, "Employee not found")
        return item

    def list(self):
        items = self.repo.list(self.org_id)
        if not items:
            provision_builtin_employees(self.db, self.org_id)
            self.db.commit()
            items = self.repo.list(self.org_id)
        return items

    def crew(self):
        return self.repo.published_for_org(self.org_id)

    def create(self, data: EmployeeCreate):
        item = self.repo.add(Employee(organization_id=self.org_id, **data.model_dump()))
        self.repo.add(
            WorkflowVersion(
                employee_id=item.id,
                version=1,
                status=WorkflowStatus.DRAFT,
                workflow=deepcopy(EMPTY),
            )
        )
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, eid, data: EmployeeUpdate):
        item = self._employee(eid)
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(item, k, v)
        self.db.commit()
        self.db.refresh(item)
        return item

    def set_status(self, eid, status):
        item = self._employee(eid)
        item.status = status
        self.db.commit()
        return item

    def duplicate(self, eid):
        original = self._employee(eid)
        item = self.repo.add(
            Employee(
                organization_id=self.org_id,
                name=f"{original.name} (Copy)",
                role=original.role,
                department=original.department,
                description=original.description,
                goal=original.goal,
                avatar=original.avatar,
                status=EmployeeStatus.INACTIVE,
            )
        )
        source = self.repo.draft(eid) or self.repo.published(eid)
        self.repo.add(
            WorkflowVersion(
                employee_id=item.id,
                version=1,
                status=WorkflowStatus.DRAFT,
                workflow=deepcopy(source.workflow if source else EMPTY),
            )
        )
        self.db.commit()
        self.db.refresh(item)
        return item

    def _validate(self, graph: WorkflowGraph):
        nodes = graph.nodes
        edges = graph.edges
        ids = {str(n.get("id")) for n in nodes}
        if len(ids) != len(nodes) or "None" in ids:
            raise HTTPException(422, "Every node needs a unique id")
        for n in nodes:
            node_type = n.get("data", {}).get("type")
            if node_type not in REGISTRY_BY_TYPE:
                raise HTTPException(422, f"Unknown node type: {node_type}")
        for e in edges:
            if str(e.get("source")) not in ids or str(e.get("target")) not in ids:
                raise HTTPException(422, "Edges must connect existing nodes")
        adjacency = {i: [] for i in ids}
        for e in edges:
            adjacency[str(e["source"])].append(str(e["target"]))
        visiting = set()
        seen = set()

        def visit(node):
            if node in visiting:
                raise HTTPException(422, "Workflow may not contain cycles")
            if node not in seen:
                visiting.add(node)
                for nxt in adjacency[node]:
                    visit(nxt)
                visiting.remove(node)
                seen.add(node)

        for node in ids:
            visit(node)
        for n in nodes:
            definition = REGISTRY_BY_TYPE[n["data"]["type"]]
            if definition["inputs"] and not any(
                str(e["target"]) == str(n["id"]) for e in edges
            ):
                raise HTTPException(
                    422, f"Required inputs are not connected for {n['id']}"
                )

    def draft(self, eid):
        self._employee(eid)
        return self.repo.draft(eid)

    def save_draft(self, eid, graph):
        self._employee(eid)
        self._validate(graph)
        draft = self.repo.draft(eid)
        if not draft:
            draft = self.repo.add(
                WorkflowVersion(
                    employee_id=eid,
                    version=self.repo.next_version(eid),
                    status=WorkflowStatus.DRAFT,
                    workflow=graph.model_dump(),
                )
            )
        else:
            draft.workflow = graph.model_dump()
        self.db.commit()
        self.db.refresh(draft)
        return draft

    def reset_draft(self, eid):
        employee = self._employee(eid)
        draft = self.repo.draft(eid)
        if employee.role in FALLBACK_WORKFLOWS:
            graph = deepcopy(FALLBACK_WORKFLOWS[employee.role])
            draft.workflow = {"nodes": graph["nodes"], "edges": graph["edges"]}
        else:
            draft.workflow = deepcopy(EMPTY)
        self.db.commit()
        return draft

    def versions(self, eid):
        self._employee(eid)
        return self.repo.versions(eid)

    def publish(self, eid):
        self._employee(eid)
        draft = self.repo.draft(eid)
        if not draft:
            raise HTTPException(409, "No draft to publish")
        self._validate(WorkflowGraph.model_validate(draft.workflow))
        current = self.repo.published(eid)
        if current:
            current.status = WorkflowStatus.ARCHIVED
        draft.status = WorkflowStatus.PUBLISHED
        self.repo.add(
            WorkflowVersion(
                employee_id=eid,
                version=self.repo.next_version(eid),
                status=WorkflowStatus.DRAFT,
                workflow=deepcopy(draft.workflow),
            )
        )
        self.db.commit()
        return draft

    def restore(self, eid, version):
        self._employee(eid)
        source = self.repo.version(eid, version)
        if not source:
            raise HTTPException(404, "Workflow version not found")
        draft = self.repo.draft(eid)
        draft.workflow = deepcopy(source.workflow)
        self.db.commit()
        return draft

    def delete_version(self, eid, version):
        self._employee(eid)
        item = self.repo.version(eid, version)
        if not item:
            raise HTTPException(404, "Workflow version not found")
        if item.status != WorkflowStatus.ARCHIVED:
            raise HTTPException(409, "Only archived workflow versions can be deleted")
        self.db.delete(item)
        self.db.commit()

    def compare(self, eid, left, right):
        self._employee(eid)
        a = self.repo.version(eid, left)
        b = self.repo.version(eid, right)
        if not a or not b:
            raise HTTPException(404, "Workflow version not found")
        an = {str(n["id"]): n for n in a.workflow.get("nodes", [])}
        bn = {str(n["id"]): n for n in b.workflow.get("nodes", [])}
        edge = lambda w: {
            f"{e.get('source')}->{e.get('target')}" for e in w.get("edges", [])
        }
        return VersionDiff(
            left_version=left,
            right_version=right,
            nodes_added=sorted(set(bn) - set(an)),
            nodes_removed=sorted(set(an) - set(bn)),
            nodes_changed=sorted(k for k in set(an) & set(bn) if an[k] != bn[k]),
            edges_added=sorted(edge(b.workflow) - edge(a.workflow)),
            edges_removed=sorted(edge(a.workflow) - edge(b.workflow)),
        )
