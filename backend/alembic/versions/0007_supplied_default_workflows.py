"""Align the built-in workflow v1 defaults with the supplied product workflows."""

import json
from alembic import op
import sqlalchemy as sa
from app.services.business_workflows import FALLBACK_WORKFLOWS

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    for role, workflow in FALLBACK_WORKFLOWS.items():
        bind.execute(
            sa.text(
                "UPDATE workflow_versions SET workflow=CAST(:workflow AS jsonb) WHERE employee_id IN (SELECT id FROM employees WHERE role=:role)"
            ),
            {
                "workflow": json.dumps(
                    {"nodes": workflow["nodes"], "edges": workflow["edges"]}
                ),
                "role": role,
            },
        )


def downgrade():
    pass
