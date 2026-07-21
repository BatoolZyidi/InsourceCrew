from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import csv, io, json
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import current_user
from app.models.employee import EmployeeStatus
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
    VersionDiff,
    WorkflowGraph,
    WorkflowVersionResponse,
)
from app.services.workflow_service import EmployeeService
from app.services.node_registry import NODE_REGISTRY
from app.schemas.execution import PlanRequest, RunRequest, RunDetail, RunResponse
from app.services.planner_service import PlannerService
from app.services.execution_service import ExecutionService
from app.services.execution_service import DUMMY_DATA_DIR
from app.models.demo_data import DemoDataset
from sqlalchemy import select

router = APIRouter(tags=["employees"])


def service(user=Depends(current_user), db: Session = Depends(get_db)):
    return EmployeeService(db, user.organization_id)


@router.get("/node-registry")
def registry():
    return {"nodes": NODE_REGISTRY}


@router.get("/employees", response_model=list[EmployeeResponse])
def list_employees(s: EmployeeService = Depends(service)):
    return s.list()


@router.get("/my-crew", response_model=list[EmployeeResponse])
def my_crew(s: EmployeeService = Depends(service)):
    return s.crew()


@router.post("/employees", response_model=EmployeeResponse, status_code=201)
def create_employee(data: EmployeeCreate, s: EmployeeService = Depends(service)):
    return s.create(data)


@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s._employee(employee_id)


@router.patch("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: UUID, data: EmployeeUpdate, s: EmployeeService = Depends(service)
):
    return s.update(employee_id, data)


@router.post("/employees/{employee_id}/archive", response_model=EmployeeResponse)
def archive(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.set_status(employee_id, EmployeeStatus.ARCHIVED)


@router.post("/employees/{employee_id}/activate", response_model=EmployeeResponse)
def activate(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.set_status(employee_id, EmployeeStatus.ACTIVE)


@router.post("/employees/{employee_id}/deactivate", response_model=EmployeeResponse)
def deactivate(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.set_status(employee_id, EmployeeStatus.INACTIVE)


@router.post(
    "/employees/{employee_id}/duplicate",
    response_model=EmployeeResponse,
    status_code=201,
)
def duplicate(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.duplicate(employee_id)


@router.get(
    "/employees/{employee_id}/workflow/draft", response_model=WorkflowVersionResponse
)
def draft(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.draft(employee_id)


@router.put(
    "/employees/{employee_id}/workflow/draft", response_model=WorkflowVersionResponse
)
def save_draft(
    employee_id: UUID, graph: WorkflowGraph, s: EmployeeService = Depends(service)
):
    return s.save_draft(employee_id, graph)


@router.post(
    "/employees/{employee_id}/workflow/reset", response_model=WorkflowVersionResponse
)
def reset(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.reset_draft(employee_id)


@router.post(
    "/employees/{employee_id}/workflow/publish", response_model=WorkflowVersionResponse
)
def publish(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.publish(employee_id)


@router.get(
    "/employees/{employee_id}/workflow/versions",
    response_model=list[WorkflowVersionResponse],
)
def versions(employee_id: UUID, s: EmployeeService = Depends(service)):
    return s.versions(employee_id)


@router.post(
    "/employees/{employee_id}/workflow/restore/{version}",
    response_model=WorkflowVersionResponse,
)
def restore(employee_id: UUID, version: int, s: EmployeeService = Depends(service)):
    return s.restore(employee_id, version)


@router.delete("/employees/{employee_id}/workflow/versions/{version}", status_code=204)
def delete_version(
    employee_id: UUID, version: int, s: EmployeeService = Depends(service)
):
    s.delete_version(employee_id, version)


@router.get("/employees/{employee_id}/workflow/compare", response_model=VersionDiff)
def compare(
    employee_id: UUID, left: int, right: int, s: EmployeeService = Depends(service)
):
    return s.compare(employee_id, left, right)


@router.post(
    "/employees/{employee_id}/workflow/regenerate",
    response_model=WorkflowVersionResponse,
)
async def regenerate(
    employee_id: UUID, data: PlanRequest, s: EmployeeService = Depends(service)
):
    return await PlannerService(s).generate_draft(employee_id, data.goal_override)


@router.post("/employees/{employee_id}/runs", response_model=RunResponse)
async def run(
    employee_id: UUID,
    data: RunRequest,
    user=Depends(current_user),
    db: Session = Depends(get_db),
):
    return await ExecutionService(db, user.organization_id).execute(
        employee_id, data.input
    )


@router.get("/employees/{employee_id}/demo-files")
def demo_files(
    employee_id: UUID, user=Depends(current_user), db: Session = Depends(get_db)
):
    EmployeeService(db, user.organization_id)._employee(employee_id)
    return {
        "files": [
            path.name
            for path in DUMMY_DATA_DIR.iterdir()
            if path.suffix in {".json", ".csv", ".txt"}
        ]
    }


@router.post("/employees/{employee_id}/runs/upload", response_model=RunResponse)
async def run_upload(
    employee_id: UUID,
    file: UploadFile = File(...),
    user=Depends(current_user),
    db: Session = Depends(get_db),
):
    raw = await file.read()
    if len(raw) > 2_000_000:
        raise HTTPException(413, "Files must be 2MB or smaller")
    try:
        text = raw.decode("utf-8")
        data = (
            json.loads(text)
            if (file.filename or "").endswith(".json")
            else (
                list(csv.DictReader(io.StringIO(text)))
                if (file.filename or "").endswith(".csv")
                else text
            )
        )
    except Exception as exc:
        raise HTTPException(422, "Could not read the uploaded file") from exc
    return await ExecutionService(db, user.organization_id).execute(
        employee_id, {"uploaded_file": file.filename, "uploaded_data": data}
    )


@router.get("/employees/{employee_id}/runs", response_model=list[RunResponse])
def runs(employee_id: UUID, user=Depends(current_user), db: Session = Depends(get_db)):
    return ExecutionService(db, user.organization_id).list_runs(employee_id)


@router.get("/runs/{run_id}", response_model=RunDetail)
def run_detail(run_id: UUID, user=Depends(current_user), db: Session = Depends(get_db)):
    run, logs = ExecutionService(db, user.organization_id).get_run(run_id)
    return {**RunResponse.model_validate(run).model_dump(), "logs": logs}


@router.delete("/runs/{run_id}", status_code=204)
def delete_run(run_id: UUID, user=Depends(current_user), db: Session = Depends(get_db)):
    ExecutionService(db, user.organization_id).delete_run(run_id)


@router.post("/runs/{run_id}/retry", response_model=RunResponse)
async def retry_run(
    run_id: UUID, user=Depends(current_user), db: Session = Depends(get_db)
):
    return await ExecutionService(db, user.organization_id).retry(run_id)


@router.get("/employees/{employee_id}/demo-data")
def demo_data(
    employee_id: UUID, user=Depends(current_user), db: Session = Depends(get_db)
):
    EmployeeService(db, user.organization_id)._employee(employee_id)
    record = db.scalar(
        select(DemoDataset).where(DemoDataset.employee_id == employee_id)
    )
    return (
        {"kind": record.kind, "payload": record.payload}
        if record
        else {"kind": None, "payload": {}}
    )


@router.get("/employees/{employee_id}/analytics")
def analytics(
    employee_id: UUID, user=Depends(current_user), db: Session = Depends(get_db)
):
    runs = ExecutionService(db, user.organization_id).list_runs(employee_id)
    return {
        "employee_id": str(employee_id),
        "runs": len(runs),
        "successes": sum(r.status.value == "success" for r in runs),
        "failures": sum(r.status.value == "failure" for r in runs),
    }
