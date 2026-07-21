from datetime import datetime
from typing import Any, Literal
from uuid import UUID
from pydantic import BaseModel, Field, model_validator
from app.models.employee import EmployeeStatus, WorkflowStatus


class EmployeeCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    role: str = Field(min_length=2, max_length=100)
    department: str = Field(min_length=2, max_length=100)
    description: str = ""
    goal: str = ""
    avatar: str | None = None


class EmployeeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    role: str | None = Field(default=None, min_length=2, max_length=100)
    department: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = None
    goal: str | None = None
    avatar: str | None = None


class EmployeeResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    role: str
    department: str
    description: str
    goal: str
    avatar: str | None
    status: EmployeeStatus
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class WorkflowGraph(BaseModel):
    nodes: list[dict[str, Any]] = Field(default_factory=list)
    edges: list[dict[str, Any]] = Field(default_factory=list)


class WorkflowVersionResponse(BaseModel):
    id: UUID
    employee_id: UUID
    version: int
    status: WorkflowStatus
    workflow: WorkflowGraph
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class VersionDiff(BaseModel):
    left_version: int
    right_version: int
    nodes_added: list[str]
    nodes_removed: list[str]
    nodes_changed: list[str]
    edges_added: list[str]
    edges_removed: list[str]
