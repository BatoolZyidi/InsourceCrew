DATA = {
    "Recruiter": {
        "job_description": "Senior Talent Partner: sourcing, structured interviews, stakeholder management.",
        "resumes": [
            {
                "name": "Aisha Rahman",
                "skills": ["sourcing", "interviews", "ATS"],
                "years": 6,
            },
            {"name": "Bilal Ahmed", "skills": ["sales", "outreach"], "years": 3},
            {
                "name": "Noor Malik",
                "skills": ["recruiting", "analytics", "DEI"],
                "years": 5,
            },
        ],
    },
    "Support": {
        "tickets": [
            {"id": i, "subject": s, "sentiment": sentiment}
            for i, (s, sentiment) in enumerate(
                [
                    ("Reset password", "neutral"),
                    ("Invoice is wrong", "negative"),
                    ("Cannot export CSV", "negative"),
                    ("How do I invite a user?", "neutral"),
                    ("App is slow", "negative"),
                    ("Change billing email", "neutral"),
                    ("SSO setup", "neutral"),
                    ("Data missing", "negative"),
                    ("Feature request", "neutral"),
                    ("Two-factor issue", "negative"),
                ],
                1,
            )
        ],
        "knowledge_base": [
            "Password reset: use Settings > Security.",
            "Invoices: submit account ID to billing.",
            "CSV exports are available to managers.",
        ],
    },
    "Sales": {
        "leads": [
            {"name": f"Lead {i}", "company": c, "employees": n, "intent": intent}
            for i, (c, n, intent) in enumerate(
                [
                    ("Northstar", 700, "high"),
                    ("Solo Studio", 4, "low"),
                    ("Harbor Co", 120, "medium"),
                    ("Vertex", 2000, "high"),
                    ("Willow", 30, "low"),
                    ("Atlas", 300, "medium"),
                    ("Kite", 60, "medium"),
                    ("Nimbus", 900, "high"),
                    ("Fern", 12, "low"),
                    ("Apex", 450, "high"),
                ],
                1,
            )
        ]
    },
    "Marketing": {
        "goal": "Increase qualified demo requests by 25% for the autumn product launch.",
        "audiences": ["Operations leaders", "SME founders", "Support managers"],
    },
    "Operations": {
        "weekly_reports": [
            {
                "week": f"2026-W{i}",
                "tickets": 120 + i * 8,
                "sales_volume": 80 + i * 5,
                "sla_percent": round(96 - i * 0.6, 1),
            }
            for i in range(1, 7)
        ]
    },
}
