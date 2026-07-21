"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Clock3, XCircle } from "lucide-react";
import { RecruiterOutput } from "@/components/employees/recruiter-output";
import { SupportOutput } from "@/components/employees/support-output";
import { SalesOutput } from "@/components/employees/sales-output";
import { MarketingOutput } from "@/components/employees/marketing-output";
import { OperationsOutput } from "@/components/employees/operations-output";

const API = "/backend";
type Run = { id: string; status: string; created_at: string };
type Log = {
  id?: string;
  node_type: string;
  status?: string;
  duration_ms?: number;
  output?: Record<string, unknown>;
};

const stepLabels: Record<string, string> = {
  "data.input.text": "Read submitted information",
  "data.input.csv": "Read uploaded spreadsheet",
  "data.input.json": "Read uploaded record",
  "ai.analyze": "Analyse the business context",
  "ai.extract": "Extract key details",
  "ai.generate": "Create the recommended work",
  "ai.evaluate": "Evaluate results",
  "ai.summarize": "Prepare the final summary",
  "logic.if": "Check the decision criteria",
  "logic.approval": "Review escalation requirements",
  "logic.score": "Calculate the score",
  "logic.rank": "Prioritise results",
  "logic.merge": "Combine findings",
  "logic.loop": "Prepare follow-up actions",
  "memory.retrieve": "Review relevant company knowledge",
  "memory.store": "Save this session's learning",
  "output.notification": "Prepare the customer update",
  "output.pdf": "Generate the report",
  "output.dashboard": "Save the final deliverable",
};
const labelFor = (nodeType: string) => nodeType;

export function SessionHistory({
  employeeId,
  refreshKey,
}: {
  employeeId: string;
  refreshKey?: string;
}) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [open, setOpen] = useState<string>();
  const [details, setDetails] = useState<Record<string, Log[]>>({});
  useEffect(() => {
    (async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        };
        const response = await fetch(
          `${API}/api/employees/${employeeId}/runs`,
          { headers },
        );
        const list = await response.json();
        if (!Array.isArray(list)) return;
        setRuns(list);
        setOpen(list[0]?.id);
        const entries = await Promise.all(
          list.map(async (run: Run) => {
            const detail = await fetch(`${API}/api/runs/${run.id}`, {
              headers,
            });
            const data = await detail.json();
            return [run.id, Array.isArray(data.logs) ? data.logs : []] as const;
          }),
        );
        setDetails(Object.fromEntries(entries));
      } catch {
        setRuns([]);
      }
    })();
  }, [employeeId, refreshKey]);

  return (
    <section className="glass mt-8 rounded-2xl p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold">Session history</h2>
          <p className="mt-1 text-sm text-slate-400">
            Your most recent session is open. Open any earlier session when
            needed.
          </p>
        </div>
        <span className="text-sm text-slate-500">{runs.length} total</span>
      </div>
      <div className="mt-5 space-y-3">
        {runs.map((run, index) => {
          const logs = details[run.id] || [];
          const output = logs.find(
            (log) => log.node_type === "output.dashboard",
          )?.output;
          const failed = run.status === "failure";
          const expanded = open === run.id;
          return (
            <article
              key={run.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]"
            >
              <button
                onClick={() => setOpen(expanded ? undefined : run.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-white/[.03]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {failed ? (
                    <XCircle className="shrink-0 text-rose-300" size={18} />
                  ) : (
                    <CheckCircle2
                      className="shrink-0 text-emerald-300"
                      size={18}
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      Session {runs.length - index}{" "}
                      <span
                        className={
                          failed
                            ? "ml-1 text-sm text-rose-300"
                            : "ml-1 text-sm text-emerald-200"
                        }
                      >
                        {failed ? "Failed" : "Completed"}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 size={12} />
                      {new Date(run.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={17}
                  className={`shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
              {expanded && (
                <div className="border-t border-white/10 p-4">
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                      Completed work
                    </p>
                    <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                      {logs.map((log, step) => (
                        <li
                          key={`${run.id}-${log.id || step}`}
                          className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2.5"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/10 text-xs font-semibold text-cyan-200">
                            {step + 1}
                          </span>
                          <span className="min-w-0 flex-1 text-sm text-slate-200">
                            {labelFor(log.node_type)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {log.duration_ms || 0}ms
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {output && <Output output={output} />}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Output({ output }: { output: Record<string, unknown> }) {
  const title = String(output.title || "").toLowerCase();
  if (title.includes("recruiter")) return <RecruiterOutput output={output} />;
  if (title.includes("support")) return <SupportOutput output={output} />;
  if (title.includes("sales") || title.includes("lead qualification"))
    return <SalesOutput output={output} />;
  if (title.includes("marketing")) return <MarketingOutput output={output} />;
  if (title.includes("operations")) return <OperationsOutput output={output} />;
  return (
    <p className="rounded-xl bg-white/[.03] p-4 leading-7 text-slate-300">
      {String(output.summary || "This session completed successfully.")}
    </p>
  );
}
