import { DeliverableCard } from "@/components/deliverables/shared";
import {
  highlights,
  text,
  type DeliverableOutput,
} from "@/components/deliverables/types";
const parse = (value?: string) => {
  try {
    return value
      ? JSON.parse(value.replace(/^[^:]+:\s*/, "").replace(/'/g, '"'))
      : undefined;
  } catch {
    return undefined;
  }
};
export function SalesOutput({ output }: { output: DeliverableOutput }) {
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((x) => x.toLowerCase().startsWith(key.toLowerCase()));
  const bant = parse(get("BANT assessment")) as
    Record<string, string> | undefined;
  const follow = parse(get("Follow-up plan")) as
    { step?: number; action?: string; delay_days?: number }[] | undefined;
  return (
    <div className="mt-5">
      <h3 className="text-xl font-semibold">Lead qualification report</h3>
      <DeliverableCard title="Qualification decision">
        {get("Qualification") || text(output, "summary")}
      </DeliverableCard>
      <DeliverableCard title="BANT assessment">
        {bant ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(bant).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-white/[.04] p-3">
                <b className="capitalize text-cyan-200">{key}</b>
                <p>{value}</p>
              </div>
            ))}
          </div>
        ) : (
          get("BANT assessment") || text(output, "summary")
        )}
      </DeliverableCard>
      <DeliverableCard title="Outreach draft">
        {get("Outreach draft") || "No outreach draft was returned."}
      </DeliverableCard>
      <DeliverableCard title="Follow-up sequence">
        {follow?.length ? (
          <ol className="space-y-2">
            {follow.map((item, i) => (
              <li key={i} className="rounded-lg bg-white/[.04] p-3">
                <b>Day {item.delay_days || 0}</b>
                <p>{item.action}</p>
              </li>
            ))}
          </ol>
        ) : (
          get("Follow-up") || "No follow-up sequence was returned."
        )}
      </DeliverableCard>
      <DeliverableCard title="CRM summary">
        {get("CRM summary") || "Lead status is ready to record in CRM."}
      </DeliverableCard>
    </div>
  );
}
