"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
type Log = {
  node_id: string;
  status: string;
  duration_ms?: number;
  error?: string;
};
export function ExecutionPanel({
  runId,
  onRetry,
}: {
  runId?: string;
  onRetry: () => void;
}) {
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    if (!runId) return;
    const timer = setInterval(async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/runs/${runId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setLogs((await res.json()).logs);
    }, 1500);
    return () => clearInterval(timer);
  }, [runId]);
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Live execution</h3>
          <p className="text-xs text-slate-500">
            Polling node progress every 1.5s
          </p>
        </div>
        <button onClick={onRetry} className="btn">
          <RotateCcw size={15} /> Retry
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {logs.length ? (
          logs.map((log) => (
            <div
              key={log.node_id}
              className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm"
            >
              {log.status === "success" ? (
                <CheckCircle2 className="text-emerald-600" size={17} />
              ) : log.status === "failure" ? (
                <AlertCircle className="text-red-600" size={17} />
              ) : (
                <Loader2 className="animate-spin text-amber-600" size={17} />
              )}
              <span className="flex-1 font-medium">{log.node_id}</span>
              <span className="text-xs text-slate-500">
                {log.error || `${log.duration_ms || 0}ms`}
              </span>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">
            Run a published workflow to view live logs.
          </p>
        )}
      </div>
    </div>
  );
}
