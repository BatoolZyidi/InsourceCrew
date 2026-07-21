"""Use valid demo addresses accepted by email validation."""

from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE users SET email=replace(email, '@acme.test', '@acme.com') WHERE email LIKE '%@acme.test'"
    )


def downgrade():
    op.execute(
        "UPDATE users SET email=replace(email, '@acme.com', '@acme.test') WHERE email LIKE '%@acme.com'"
    )
