"""Planner/executor run persistence."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    rs = postgresql.ENUM(
        "queued", "running", "success", "failure", name="run_status", create_type=False
    )
    ns = postgresql.ENUM(
        "running",
        "success",
        "failure",
        "retry",
        name="node_run_status",
        create_type=False,
    )
    postgresql.ENUM(
        "queued", "running", "success", "failure", name="run_status"
    ).create(bind, checkfirst=True)
    postgresql.ENUM(
        "running", "success", "failure", "retry", name="node_run_status"
    ).create(bind, checkfirst=True)
    op.create_table(
        "execution_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "workflow_version_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workflow_versions.id"),
            nullable=False,
        ),
        sa.Column("status", rs, nullable=False),
        sa.Column("input", postgresql.JSONB(), nullable=False),
        sa.Column("context", postgresql.JSONB(), nullable=False),
        sa.Column("error", sa.Text()),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )
    op.create_table(
        "node_execution_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("execution_runs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("node_id", sa.String(160), nullable=False),
        sa.Column("node_type", sa.String(120), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("status", ns, nullable=False),
        sa.Column("duration_ms", sa.Integer()),
        sa.Column("input", postgresql.JSONB(), nullable=False),
        sa.Column("output", postgresql.JSONB()),
        sa.Column("error", sa.Text()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )


def downgrade():
    op.drop_table("node_execution_logs")
    op.drop_table("execution_runs")
