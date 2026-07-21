NODE_REGISTRY = [
    {
        "type": "ai.analyze",
        "category": "AI",
        "label": "Analyze",
        "inputs": ["text"],
        "outputs": ["analysis_json"],
        "config_schema": {"prompt_template": "string", "output_fields": "array"},
    },
    {
        "type": "ai.generate",
        "category": "AI",
        "label": "Generate",
        "inputs": ["prompt"],
        "outputs": ["text"],
        "config_schema": {"prompt_template": "string"},
    },
    {
        "type": "ai.evaluate",
        "category": "AI",
        "label": "Evaluate",
        "inputs": ["content"],
        "outputs": ["score"],
        "config_schema": {"criteria": "array"},
    },
    {
        "type": "ai.extract",
        "category": "AI",
        "label": "Extract",
        "inputs": ["text"],
        "outputs": ["fields"],
        "config_schema": {"output_fields": "array"},
    },
    {
        "type": "ai.summarize",
        "category": "AI",
        "label": "Summarize",
        "inputs": ["text"],
        "outputs": ["summary"],
        "config_schema": {"style": "string"},
    },
    {
        "type": "ai.research",
        "category": "AI",
        "label": "Research",
        "inputs": ["query"],
        "outputs": ["research_json"],
        "config_schema": {"query": "string", "use_serpapi": "boolean"},
    },
    *[
        {
            "type": f"logic.{x}",
            "category": "Logic",
            "label": x.title(),
            "inputs": ["input"],
            "outputs": ["output"],
            "config_schema": {},
        }
        for x in ["if", "loop", "merge", "score", "rank", "approval"]
    ],
    *[
        {
            "type": f"memory.{x}",
            "category": "Memory",
            "label": x.title(),
            "inputs": ["key"],
            "outputs": ["value"],
            "config_schema": {},
        }
        for x in ["retrieve", "store", "update"]
    ],
    *[
        {
            "type": f"data.input.{x}",
            "category": "Data",
            "label": f"Input {x.upper()}",
            "inputs": [],
            "outputs": ["data"],
            "config_schema": {"value": "string"},
        }
        for x in ["csv", "json", "text"]
    ],
    *[
        {
            "type": f"output.{x}",
            "category": "Output",
            "label": x.title(),
            "inputs": ["content"],
            "outputs": [],
            "config_schema": {},
        }
        for x in ["dashboard", "pdf", "notification"]
    ],
]
REGISTRY_BY_TYPE = {n["type"]: n for n in NODE_REGISTRY}
