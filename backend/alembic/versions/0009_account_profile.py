"""Add account profile metadata."""

from alembic import op
import sqlalchemy as sa

revision = "0009"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("phone", sa.String(40), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(512), nullable=True))


def downgrade():
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "phone")
