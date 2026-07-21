"""The five approved registry-only v1 fallback workflows."""


def build(employee, specs, edges):
    return {
        "employee": employee.lower(),
        "version": "v1",
        "nodes": [
            {
                "id": node_id,
                "position": {"x": index * 220, "y": 120 + (index % 2) * 100},
                "data": {"type": node_type, "label": label, "config": config},
            }
            for index, (node_id, node_type, label, config) in enumerate(specs)
        ],
        "edges": [
            {
                "id": f"{source}-{target}",
                "source": source,
                "target": target,
                "label": label or "",
            }
            for source, target, label in edges
        ],
    }


FALLBACK_WORKFLOWS = {
    "Recruiter": build(
        "Recruiter",
        [
            ("n1", "data.input.text", "Job Description Input", {}),
            ("n2", "data.input.text", "Resume Input", {}),
            (
                "n3",
                "ai.analyze",
                "Resume Analysis",
                {"prompt_template": "Analyze this resume against the job description."},
            ),
            (
                "n4",
                "ai.extract",
                "Skill Extraction",
                {"output_fields": ["skills", "years_experience", "education"]},
            ),
            ("n5", "logic.score", "Resume Match Score", {"weight": 1.0}),
            ("n6", "logic.rank", "Rank Candidates", {}),
            ("n7", "ai.summarize", "Hiring Report Summary", {}),
            ("n8", "output.pdf", "Hiring Report", {}),
            ("n9", "output.dashboard", "Recruiter Dashboard", {}),
        ],
        [
            ("n1", "n3", None),
            ("n2", "n3", None),
            ("n3", "n4", None),
            ("n4", "n5", None),
            ("n5", "n6", None),
            ("n6", "n7", None),
            ("n7", "n8", None),
            ("n7", "n9", None),
        ],
    ),
    "Support": build(
        "Support",
        [
            ("n1", "data.input.text", "Ticket Input", {}),
            (
                "n2",
                "ai.analyze",
                "Classify Ticket",
                {"output_fields": ["category", "sentiment", "urgency"]},
            ),
            ("n3", "memory.retrieve", "Knowledge Base Search", {}),
            (
                "n4",
                "ai.generate",
                "Draft Response",
                {
                    "prompt_template": "Draft a response using {kb_result} for ticket {ticket}"
                },
            ),
            (
                "n5",
                "logic.if",
                "Confidence/Sentiment Check",
                {"condition": "sentiment == negative OR confidence < 0.7"},
            ),
            ("n6", "logic.approval", "Escalate to Human Manager", {}),
            ("n7", "output.notification", "Send Auto-Reply", {}),
            ("n8", "memory.store", "Log Resolution", {}),
            ("n9", "output.dashboard", "Support Dashboard", {}),
        ],
        [
            ("n1", "n2", None),
            ("n2", "n3", None),
            ("n3", "n4", None),
            ("n4", "n5", None),
            ("n5", "n6", "escalate"),
            ("n5", "n7", "auto-reply"),
            ("n6", "n8", None),
            ("n7", "n8", None),
            ("n8", "n9", None),
        ],
    ),
    "Sales": build(
        "Sales",
        [
            ("n1", "data.input.json", "Lead Input", {}),
            (
                "n2",
                "ai.analyze",
                "Research Lead (SerpAPI optional)",
                {"tool": "serpapi", "enabled": False},
            ),
            (
                "n3",
                "logic.score",
                "Qualification Score",
                {"criteria": ["budget", "authority", "need", "timeline"]},
            ),
            ("n4", "logic.if", "Qualified?", {"condition": "score >= 60"}),
            ("n5", "ai.generate", "Draft Outreach Email", {}),
            ("n6", "memory.store", "Discard/Nurture Log", {}),
            ("n7", "logic.loop", "Schedule Follow-up Sequence", {}),
            ("n8", "output.notification", "Mock CRM Update", {}),
            ("n9", "ai.summarize", "CRM Report Summary", {}),
            ("n10", "output.dashboard", "Sales Dashboard", {}),
        ],
        [
            ("n1", "n2", None),
            ("n2", "n3", None),
            ("n3", "n4", None),
            ("n4", "n5", "qualified"),
            ("n4", "n6", "nurture"),
            ("n5", "n7", None),
            ("n7", "n8", None),
            ("n8", "n9", None),
            ("n9", "n10", None),
        ],
    ),
    "Marketing": build(
        "Marketing",
        [
            ("n1", "data.input.text", "Business Goal Input", {}),
            ("n2", "ai.analyze", "Define Target Audience", {}),
            ("n3", "ai.generate", "Campaign Brief", {}),
            (
                "n4",
                "ai.generate",
                "Content Variants",
                {"variants": 3, "formats": ["social_post", "caption", "ad_copy"]},
            ),
            ("n5", "logic.merge", "Build Content Calendar", {}),
            ("n6", "ai.evaluate", "Performance Projection (mock metrics)", {}),
            ("n7", "memory.store", "Save Campaign", {}),
            ("n8", "output.dashboard", "Marketing Dashboard", {}),
        ],
        [
            ("n1", "n2", None),
            ("n2", "n3", None),
            ("n3", "n4", None),
            ("n4", "n5", None),
            ("n5", "n6", None),
            ("n6", "n7", None),
            ("n7", "n8", None),
        ],
    ),
    "Operations": build(
        "Operations",
        [
            ("n1", "data.input.csv", "Operational Reports Input", {}),
            (
                "n2",
                "ai.extract",
                "Extract KPIs",
                {
                    "output_fields": [
                        "ticket_volume",
                        "sales_volume",
                        "avg_response_time",
                    ]
                },
            ),
            ("n3", "ai.analyze", "Detect Bottlenecks", {}),
            ("n4", "logic.rank", "Rank Issues by Impact", {}),
            ("n5", "ai.generate", "Improvement Suggestions", {}),
            ("n6", "ai.summarize", "Executive Summary", {}),
            ("n7", "output.pdf", "Executive Report", {}),
            ("n8", "output.dashboard", "Operations Dashboard", {}),
        ],
        [
            ("n1", "n2", None),
            ("n2", "n3", None),
            ("n3", "n4", None),
            ("n4", "n5", None),
            ("n5", "n6", None),
            ("n6", "n7", None),
            ("n6", "n8", None),
        ],
    ),
}
