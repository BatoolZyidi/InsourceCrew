from datetime import datetime
from typing import Any
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.execution import NodeRunStatus, RunStatus


class PlanRequest(BaseModel):
    goal_override: str | None = None


class RunRequest(BaseModel):
    input: dict[str, Any] = Field(default_factory=dict)


class NodeLogResponse(BaseModel):
    id: UUID
    node_id: str
    node_type: str
    sequence: int
    status: NodeRunStatus
    duration_ms: int | None
    input: dict
    output: dict | None
    error: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class RunResponse(BaseModel):
    id: UUID
    employee_id: UUID
    workflow_version_id: UUID
    status: RunStatus
    input: dict
    context: dict
    error: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}


class RunDetail(RunResponse):
    logs: list[NodeLogResponse]
