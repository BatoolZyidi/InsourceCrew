"""Initial organization/auth schema and development seed data."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from app.core.security import hash_password

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    role = postgresql.ENUM(
        "owner", "manager", "viewer", name="user_role", create_type=False
    )
    postgresql.ENUM("owner", "manager", "viewer", name="user_role").create(
        op.get_bind(), checkfirst=True
    )
    op.create_table(
        "organizations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False, unique=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )
    op.create_table(
        "departments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(100), nullable=False),
    )
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "organization_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(160), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("fingerprint", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    op.execute(
        "INSERT INTO organizations (id,name) VALUES (gen_random_uuid(),'Acme Technologies')"
    )
    op.execute(
        "INSERT INTO departments (id,organization_id,name) SELECT gen_random_uuid(),id,department FROM organizations CROSS JOIN (VALUES ('HR'),('Sales'),('Marketing'),('Support'),('Operations')) AS d(department) WHERE name='Acme Technologies'"
    )
    conn = op.get_bind()
    org = conn.execute(
        sa.text("SELECT id FROM organizations WHERE name='Acme Technologies'")
    ).scalar_one()
    for email, name, role_name in [
        ("maya.chen@acme.com", "Maya Chen", "owner"),
        ("omar.khan@acme.com", "Omar Khan", "manager"),
        ("sarah.ali@acme.com", "Sarah Ali", "viewer"),
    ]:
        conn.execute(
            sa.text(
                "INSERT INTO users (id,organization_id,email,full_name,password_hash,role,is_active) VALUES (gen_random_uuid(),:org,:email,:name,:password,:role,true)"
            ),
            {
                "org": org,
                "email": email,
                "name": name,
                "password": hash_password("AcmeDemo!2026"),
                "role": role_name,
            },
        )


def downgrade():
    op.drop_table("refresh_tokens")
    op.drop_table("users")
    op.drop_table("departments")
    op.drop_table("organizations")
    postgresql.ENUM(name="user_role").drop(op.get_bind(), checkfirst=True)
