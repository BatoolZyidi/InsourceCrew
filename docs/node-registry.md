# Node Registry

The backend endpoint `GET /api/node-registry` is the runtime source of truth.

| Category | Node types |
| --- | --- |
| AI | `ai.analyze`, `ai.generate`, `ai.evaluate`, `ai.extract`, `ai.summarize`, `ai.research` |
| Logic | `logic.if`, `logic.loop`, `logic.merge`, `logic.score`, `logic.rank` |
| Memory | `memory.retrieve`, `memory.store`, `memory.update` |
| Data | `data.input.csv`, `data.input.json`, `data.input.text` |
| Output | `output.dashboard`, `output.pdf`, `output.notification` |

Every registry item declares required inputs, outputs, and an editable `config_schema`. `ai.research` accepts `query` and `use_serpapi`; SerpAPI stays disabled unless `SERPAPI_ENABLED=true` and a key is configured.
