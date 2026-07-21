import { DeliverableCard } from "@/components/deliverables/shared";
import {
  cleanLabel,
  displayValue,
  highlights,
  text,
  type DeliverableOutput,
} from "@/components/deliverables/types";

function parse(value?: string): unknown {
  try {
    return value
      ? JSON.parse(value.replace(/^[^:]+:\s*/, "").replace(/'/g, '"'))
      : undefined;
  } catch {
    return undefined;
  }
}

export function SalesOutput({ output }: { output: DeliverableOutput }) {
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((row) => row.toLowerCase().startsWith(key.toLowerCase()));
  const bant = parse(get("BANT assessment")) as Record<string, unknown> | undefined;
  const follow = parse(get("Follow-up plan")) as
    | { step?: number; action?: unknown; delay_days?: number; timing?: unknown }[]
    | undefined;

  return (
    <div className="mt-5 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Lead qualification report</h3>
        <p className="mt-1 text-sm text-slate-400">
          Qualification, recommended outreach, and the CRM-ready next steps.
        </p>
      </div>
      <DeliverableCard title="Qualification decision">
        {cleanLabel(get("Qualification")) || text(output, "summary")}
      </DeliverableCard>
      <DeliverableCard title="BANT assessment">
        {bant ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(bant).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-white/[.04] p-3">
                <b className="capitalize text-cyan-200">{key}</b>
                <p className="mt-1">{displayValue(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          cleanLabel(get("BANT assessment")) || text(output, "summary")
        )}
      </DeliverableCard>
      <DeliverableCard title="Outreach draft">
        <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/25 p-4 leading-7">
          {cleanLabel(get("Outreach draft")) || "No outreach draft was returned."}
        </div>
      </DeliverableCard>
      <DeliverableCard title="Follow-up sequence">
        {follow?.length ? (
          <ol className="space-y-2">
            {follow.map((item, index) => (
              <li key={`${item.step || index}-${index}`} className="rounded-xl bg-white/[.04] p-3">
                <b>
                  {item.delay_days !== undefined
                    ? `Day ${item.delay_days}`
                    : displayValue(item.timing ?? `Step ${item.step || index + 1}`)}
                </b>
                <p className="mt-1">{displayValue(item.action)}</p>
              </li>
            ))}
          </ol>
        ) : (
          cleanLabel(get("Follow-up")) || "No follow-up sequence was returned."
        )}
      </DeliverableCard>
      <DeliverableCard title="CRM summary">
        {cleanLabel(get("CRM summary")) || "Lead status is ready to record in CRM."}
      </DeliverableCard>
    </div>
  );
}
