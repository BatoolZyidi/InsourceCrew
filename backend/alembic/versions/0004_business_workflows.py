"""Default business workflows and scoped dummy datasets."""

import json
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from app.services.business_workflows import FALLBACK_WORKFLOWS
from app.services.demo_data import DATA

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    op.create_table(
        "demo_datasets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("kind", sa.String(80), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )
    rows = bind.execute(
        sa.text(
            "SELECT id,role FROM employees WHERE role IN ('Recruiter','Support','Sales','Marketing','Operations')"
        )
    ).mappings()
    for row in rows:
        payload = json.dumps(FALLBACK_WORKFLOWS[row["role"]])
        bind.execute(
            sa.text(
                "UPDATE workflow_versions SET workflow=CAST(:payload AS jsonb),status='published' WHERE employee_id=:id AND version=1"
            ),
            {"payload": payload, "id": row["id"]},
        )
        bind.execute(
            sa.text(
                "INSERT INTO workflow_versions (id,employee_id,version,status,workflow) VALUES (gen_random_uuid(),:id,2,'draft',CAST(:payload AS jsonb))"
            ),
            {"payload": payload, "id": row["id"]},
        )
        bind.execute(
            sa.text(
                "INSERT INTO demo_datasets (id,employee_id,kind,payload) VALUES (gen_random_uuid(),:id,:kind,CAST(:payload AS jsonb))"
            ),
            {
                "id": row["id"],
                "kind": row["role"].lower(),
                "payload": json.dumps(DATA[row["role"]]),
            },
        )


def downgrade():
    op.drop_table("demo_datasets")
    op.execute("DELETE FROM workflow_versions WHERE version=2")
    op.execute(
        "UPDATE workflow_versions SET status='draft',workflow=CAST('{\"nodes\":[],\"edges\":[]}' AS jsonb) WHERE version=1"
    )
