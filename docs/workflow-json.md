# Workflow JSON schema

Each workflow version stores an isolated JSON graph:

```json
{
  "nodes": [{"id":"unique-id","position":{"x":0,"y":0},"data":{"type":"ai.analyze","label":"Analyze","config":{"prompt_template":"..."}}}],
  "edges": [{"id":"edge-1","source":"source-node-id","target":"target-node-id"}]
}
```

`data.type` must exist in the Node Registry. Node IDs must be unique; edge endpoints must exist; cycles are invalid; and nodes with declared inputs must have an inbound edge. Drafts are editable. Publishing promotes the draft, archives the prior published version, and creates a new draft.
