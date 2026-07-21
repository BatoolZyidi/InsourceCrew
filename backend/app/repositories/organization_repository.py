from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.organization import Organization


class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def by_name(self, name: str) -> Organization | None:
        return self.db.scalar(select(Organization).where(Organization.name == name))

    def create(self, name: str) -> Organization:
        entity = Organization(name=name)
        self.db.add(entity)
        self.db.flush()
        return entity
