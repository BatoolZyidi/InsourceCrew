"""The initial Alembic migration seeds development data; this command documents the idempotent seed workflow."""

from app.core.database import engine
from app.models.organization import Organization
from sqlalchemy import select


def main():
    with engine.connect() as connection:
        exists = connection.execute(
            select(Organization.id).where(Organization.name == "Acme Technologies")
        ).scalar_one_or_none()
    print(
        "Acme Technologies seed is present." if exists else "Run: alembic upgrade head"
    )


if __name__ == "__main__":
    main()
