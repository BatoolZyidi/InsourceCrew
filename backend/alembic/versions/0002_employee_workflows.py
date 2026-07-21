"""Employee system, independent workflow version history, and built-in shells."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    employee_status = postgresql.ENUM(
        "active", "inactive", "archived", name="employee_status", create_type=False
    )
    workflow_status = postgresql.ENUM(
        "draft", "published", "archived", name="workflow_status", create_type=False
    )
    postgresql.ENUM("active", "inactive", "archived", name="employee_status").create(
        bind, checkfirst=True
    )
    postgresql.ENUM("draft", "published", "archived", name="workflow_status").create(
        bind, checkfirst=True
    )
    op.create_table(
        "employees",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("role", sa.String(100), nullable=False),
        sa.Column("department", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("goal", sa.Text(), nullable=False, server_default=""),
        sa.Column("avatar", sa.String(512)),
        sa.Column("status", employee_status, nullable=False, server_default="active"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )
    op.create_table(
        "workflow_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("status", workflow_status, nullable=False),
        sa.Column("workflow", postgresql.JSONB(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.UniqueConstraint(
            "employee_id", "version", name="uq_employee_workflow_version"
        ),
    )
    op.create_index("ix_employees_organization_id", "employees", ["organization_id"])
    op.create_index(
        "ix_workflow_versions_employee_id", "workflow_versions", ["employee_id"]
    )
    bind.execute(
        sa.text(
            "INSERT INTO employees (id,organization_id,name,role,department,description,goal,status) SELECT gen_random_uuid(),id,role,role,department,'Built-in AI employee shell','Configure this employee workflow','active' FROM organizations CROSS JOIN (VALUES ('Recruiter','HR'),('Sales','Sales'),('Marketing','Marketing'),('Support','Support'),('Operations','Operations')) AS shells(role,department) WHERE name='Acme Technologies'"
        )
    )
    bind.execute(
        sa.text(
            "INSERT INTO workflow_versions (id,employee_id,version,status,workflow) SELECT gen_random_uuid(),id,1,'draft',CAST('{\"nodes\":[],\"edges\":[]}' AS jsonb) FROM employees"
        )
    )


def downgrade():
    op.drop_table("workflow_versions")
    op.drop_table("employees")
    postgresql.ENUM(name="workflow_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="employee_status").drop(op.get_bind(), checkfirst=True)
