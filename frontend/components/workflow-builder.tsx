"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  PanelRight,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";
const API = "/backend";
type Graph = { nodes: Node[]; edges: Edge[] };
type Draft = { version: number; workflow: Graph };
type Version = { version: number; status: "draft" | "published" | "archived" };
type Registry = {
  type: string;
  category: string;
  label: string;
  config_schema?: Record<string, string>;
};
const registry: Registry[] = [
  {
    type: "data.input.text",
    category: "Data",
    label: "Text input",
    config_schema: { value: "string", file: "string" },
  },
  {
    type: "data.input.json",
    category: "Data",
    label: "JSON input",
    config_schema: { file: "string" },
  },
  {
    type: "data.input.csv",
    category: "Data",
    label: "CSV input",
    config_schema: { file: "string" },
  },
  {
    type: "ai.analyze",
    category: "AI",
    label: "Analyze",
    config_schema: { prompt_template: "string" },
  },
  {
    type: "ai.generate",
    category: "AI",
    label: "Generate",
    config_schema: { prompt_template: "string" },
  },
  { type: "ai.evaluate", category: "AI", label: "Evaluate" },
  {
    type: "ai.extract",
    category: "AI",
    label: "Extract",
    config_schema: { output_fields: "array" },
  },
  { type: "ai.summarize", category: "AI", label: "Summarize" },
  {
    type: "logic.if",
    category: "Logic",
    label: "Condition",
    config_schema: { condition: "string" },
  },
  {
    type: "logic.score",
    category: "Logic",
    label: "Score",
    config_schema: { weight: "number" },
  },
  { type: "logic.rank", category: "Logic", label: "Rank" },
  { type: "logic.merge", category: "Logic", label: "Merge" },
  { type: "logic.loop", category: "Logic", label: "Loop" },
  { type: "logic.approval", category: "Logic", label: "Approval" },
  { type: "memory.retrieve", category: "Memory", label: "Retrieve" },
  { type: "memory.store", category: "Memory", label: "Store" },
  { type: "output.dashboard", category: "Output", label: "Dashboard" },
  {
    type: "output.pdf",
    category: "Output",
    label: "PDF report",
    config_schema: { title: "string", document_name: "string" },
  },
  {
    type: "output.notification",
    category: "Output",
    label: "Notification",
    config_schema: { channel: "string", message: "string" },
  },
];
export function WorkflowBuilder({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<Node>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<Draft>();
  const [versions, setVersions] = useState<Version[]>([]);
  const flow = useRef<ReactFlowInstance | null>(null);
  const categories = useMemo(
    () => [...new Set(registry.map((x) => x.category))],
    [],
  );
  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [draftResponse, versionResponse] = await Promise.all([
        fetch(`${API}/api/employees/${employeeId}/workflow/draft`, {
          headers: headers(),
        }),
        fetch(`${API}/api/employees/${employeeId}/workflow/versions`, {
          headers: headers(),
        }),
      ]);
      if (!draftResponse.ok || !versionResponse.ok)
        throw Error("Unable to load workflow data.");
      const nextDraft: Draft = await draftResponse.json();
      setDraft(nextDraft);
      setNodes(nextDraft.workflow.nodes || []);
      setEdges(nextDraft.workflow.edges || []);
      setVersions(await versionResponse.json());
      requestAnimationFrame(() =>
        flow.current?.fitView({ padding: 0.18, duration: 350 }),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load workflow data.",
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId, setEdges, setNodes]);
  useEffect(() => {
    void load();
  }, [load]);
  const request = async (path: string, options: RequestInit = {}) =>
    fetch(`${API}/api/employees/${employeeId}${path}`, {
      ...options,
      headers: {
        ...headers(),
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  const save = async () => {
    const r = await request("/workflow/draft", {
      method: "PUT",
      body: JSON.stringify({ nodes, edges }),
    });
    if (r.ok) {
      setNotice("Draft saved.");
      await load();
    } else setNotice("Fix the workflow validation errors before saving.");
  };
  const publish = async () => {
    await save();
    const r = await request("/workflow/publish", { method: "POST" });
    setNotice(
      r.ok
        ? "Published successfully. A new Draft was created."
        : "Publishing failed. Save a valid Draft first.",
    );
    if (r.ok) await load();
  };
  const reset = async () => {
    const r = await request("/workflow/reset", { method: "POST" });
    if (r.ok) {
      setNotice("Draft reset.");
      await load();
    }
  };
  const restore = async (version: number) => {
    const r = await request(`/workflow/restore/${version}`, { method: "POST" });
    if (r.ok) {
      setNotice(`Version ${version} restored into Draft.`);
      await load();
    }
  };
  const deleteVersion = async (version: number) => {
    if (!confirm(`Delete archived version ${version}?`)) return;
    const r = await request(`/workflow/versions/${version}`, {
      method: "DELETE",
    });
    setNotice(
      r.ok
        ? `Version ${version} deleted.`
        : "Only archived versions can be deleted.",
    );
    if (r.ok) await load();
  };
  useEffect(() => {
    const published = versions.find((v) => v.status === "published");
    document
      .querySelectorAll<HTMLElement>("[data-workflow-version]")
      .forEach((x) => x.remove());
    const header = document.querySelector("header div");
    if (header && published) {
      const badge = document.createElement("p");
      badge.dataset.workflowVersion = "true";
      badge.className = "mt-1 text-xs text-cyan-200";
      badge.textContent = `Current published version: v${published.version}`;
      header.appendChild(badge);
    }
    versions
      .filter((v) => v.status === "archived")
      .forEach((v) => {
        const row = [
          ...document.querySelectorAll<HTMLElement>(".mt-8 .rounded-xl"),
        ].find((x) => x.textContent?.includes(`archived v${v.version}`));
        if (!row) return;
        const button = document.createElement("button");
        button.dataset.workflowVersion = "true";
        button.className =
          "ml-2 text-xs font-semibold text-rose-300 hover:text-rose-200";
        button.textContent = "Delete";
        button.onclick = () => void deleteVersion(v.version);
        row.appendChild(button);
      });
  }, [versions]);
  const add = (entry: Registry) => {
    const node: Node = {
      id: `${entry.type}-${Date.now()}`,
      position: {
        x: 180 + (nodes.length % 3) * 230,
        y: 100 + Math.floor(nodes.length / 3) * 160,
      },
      data: { label: entry.label, type: entry.type, config: {} },
    };
    setNodes((current) => [...current, node]);
    setSelected(node);
  };
  if (loading) return <Loading />;
  if (error)
    return (
      <main className="aurora grid min-h-screen place-items-center">
        <div className="glass rounded-3xl p-8 text-center">
          <p>{error}</p>
          <button onClick={() => void load()} className="btn-primary mt-5">
            Try again
          </button>
        </div>
      </main>
    );
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
            Workflow Builder
          </p>
          <h1 className="mt-1 text-lg font-semibold">
            Draft v{draft?.version}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {notice && (
            <span className="max-w-64 text-xs text-emerald-300">{notice}</span>
          )}
          <button onClick={reset} className="btn-ghost">
            <RotateCcw size={16} />
            Reset
          </button>
          <button onClick={save} className="btn-ghost">
            <Save size={16} />
            Save draft
          </button>
          <button onClick={publish} className="btn-primary">
            <Play size={16} />
            Publish
          </button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[230px_1fr_300px]">
        <aside className="overflow-auto border-r border-white/10 bg-slate-950 p-4">
          <h2 className="text-sm font-semibold">Node library</h2>
          {categories.map((c) => (
            <section key={c} className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {c}
              </p>
              {registry
                .filter((n) => n.category === c)
                .map((n) => (
                  <button
                    key={n.type}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("node", n.type)}
                    onClick={() => add(n)}
                    className="mb-2 w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-left hover:border-cyan-200/40"
                  >
                    <span className="block text-sm font-medium">{n.label}</span>
                    <span className="text-xs text-slate-500">{n.type}</span>
                  </button>
                ))}
            </section>
          ))}
        </aside>
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const entry = registry.find(
              (n) => n.type === e.dataTransfer.getData("node"),
            );
            if (entry) add(entry);
          }}
          className="relative bg-[#0b1020]"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, n) => setSelected(n)}
            onNodesDelete={() => setSelected(undefined)}
            onConnect={(c: Connection) => setEdges((x) => addEdge(c, x))}
            onInit={(x) => {
              flow.current = x;
              requestAnimationFrame(() => x.fitView({ padding: 0.18 }));
            }}
            fitView
          >
            <Background color="#475569" gap={20} />
            <MiniMap />
            <Controls />
          </ReactFlow>
          {!nodes.length && (
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <p className="rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-400">
                This Draft has no nodes yet.
              </p>
            </div>
          )}
        </section>
        <aside className="overflow-auto border-l border-white/10 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Configuration</h2>
            <PanelRight size={17} className="text-slate-500" />
          </div>
          {selected ? (
            <Config node={selected} setNodes={setNodes} />
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              Select a node to configure it.
            </p>
          )}
          <div className="mt-8 border-t border-white/10 pt-5">
            <h3 className="font-semibold">Version history</h3>
            <div className="mt-3 space-y-2">
              {versions.map((v) => (
                <div
                  key={`${v.status}-${v.version}`}
                  className="flex items-center justify-between rounded-xl bg-white/[.04] p-3 text-sm"
                >
                  <span className="capitalize">
                    {v.status} v{v.version}
                  </span>
                  {v.status !== "draft" ? (
                    <button
                      onClick={() => restore(v.version)}
                      className="flex items-center gap-1 text-xs font-semibold text-cyan-200"
                    >
                      <ArchiveRestore size={14} />
                      Restore
                    </button>
                  ) : (
                    <CheckCircle2 size={15} className="text-amber-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Config({
  node,
  setNodes,
}: {
  node: Node;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}) {
  const data = node.data as {
    label: string;
    type: string;
    config?: Record<string, unknown>;
  };
  const schema =
    registry.find((n) => n.type === data.type)?.config_schema || {};
  const update = (key: string, value: unknown) =>
    setNodes((items) =>
      items.map((item) =>
        item.id === node.id
          ? {
              ...item,
              data: {
                ...item.data,
                config: {
                  ...((item.data as { config?: Record<string, unknown> })
                    .config || {}),
                  [key]: value,
                },
              },
            }
          : item,
      ),
    );
  return (
    <div className="mt-5">
      <label className="text-xs text-slate-400">Node name</label>
      <input
        value={data.label}
        onChange={(e) =>
          setNodes((items) =>
            items.map((i) =>
              i.id === node.id
                ? { ...i, data: { ...i.data, label: e.target.value } }
                : i,
            ),
          )
        }
        className="field mt-1 w-full"
      />
      <p className="mt-4 font-mono text-xs text-cyan-100">{data.type}</p>
      {Object.entries(schema).map(([key, type]) => (
        <label key={key} className="mt-4 block text-xs text-slate-400">
          {key} <span className="text-slate-600">({type})</span>
          <textarea
            defaultValue={String(data.config?.[key] ?? "")}
            onBlur={(e) =>
              update(
                key,
                type === "number" ? Number(e.target.value) : e.target.value,
              )
            }
            className="mt-1 min-h-16 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white"
          />
        </label>
      ))}
    </div>
  );
}
function Loading() {
  return (
    <main className="aurora grid min-h-screen place-items-center">
      <div className="glass flex flex-col items-center rounded-3xl p-10">
        <LoaderCircle className="animate-spin text-cyan-200" size={30} />
        <p className="mt-4 font-semibold">Loading workflow</p>
        <p className="mt-1 text-sm text-slate-400">
          Preparing editable configuration.
        </p>
      </div>
    </main>
  );
}
