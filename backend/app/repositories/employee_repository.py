from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.employee import Employee, WorkflowVersion, WorkflowStatus


class EmployeeRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, org_id):
        return list(
            self.db.scalars(
                select(Employee)
                .where(Employee.organization_id == org_id)
                .order_by(Employee.created_at.desc())
            )
        )

    def get(self, employee_id, org_id):
        return self.db.scalar(
            select(Employee).where(
                Employee.id == employee_id, Employee.organization_id == org_id
            )
        )

    def add(self, item):
        self.db.add(item)
        self.db.flush()
        return item

    def draft(self, eid):
        return self.db.scalar(
            select(WorkflowVersion).where(
                WorkflowVersion.employee_id == eid,
                WorkflowVersion.status == WorkflowStatus.DRAFT,
            )
        )

    def published(self, eid):
        return self.db.scalar(
            select(WorkflowVersion).where(
                WorkflowVersion.employee_id == eid,
                WorkflowVersion.status == WorkflowStatus.PUBLISHED,
            )
        )

    def version(self, eid, version):
        return self.db.scalar(
            select(WorkflowVersion).where(
                WorkflowVersion.employee_id == eid, WorkflowVersion.version == version
            )
        )

    def versions(self, eid):
        return list(
            self.db.scalars(
                select(WorkflowVersion)
                .where(WorkflowVersion.employee_id == eid)
                .order_by(WorkflowVersion.version.desc())
            )
        )

    def published_for_org(self, org_id):
        # Built-in templates begin at v1. An employee enters My Crew only after the
        # user explicitly publishes its editable Draft (v2 or later).
        return list(
            self.db.scalars(
                select(Employee)
                .join(WorkflowVersion, WorkflowVersion.employee_id == Employee.id)
                .where(
                    Employee.organization_id == org_id,
                    WorkflowVersion.status == WorkflowStatus.PUBLISHED,
                    WorkflowVersion.version >= 2,
                )
                .order_by(Employee.name)
            )
        )

    def next_version(self, eid):
        return (
            self.db.scalar(
                select(func.max(WorkflowVersion.version)).where(
                    WorkflowVersion.employee_id == eid
                )
            )
            or 0
        ) + 1
