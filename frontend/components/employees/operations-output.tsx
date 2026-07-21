import { DeliverableCard } from "@/components/deliverables/shared";
import {
  highlights,
  text,
  cleanLabel,
  displayValue,
  type DeliverableOutput,
} from "@/components/deliverables/types";
const parse = (value?: string) => {
  try {
    return value ? JSON.parse(value.replace(/^[^:]+:\s*/, "")) : undefined;
  } catch {
    return undefined;
  }
};
export function OperationsOutput({ output }: { output: DeliverableOutput }) {
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((x) => x.toLowerCase().startsWith(key.toLowerCase()));
  const summary = text(output, "summary");
  const plan = parse(
    get("Follow-up plan") || get("Prioritized improvements"),
  ) as
    | {
        action?: string;
        description?: string;
        owner?: string;
        due_date?: string;
      }[]
    | undefined;
  return (
    <div className="mt-5">
      <h3 className="text-xl font-semibold">Operations executive report</h3>
      <DeliverableCard title="KPI summary">
        {cleanLabel(get("KPI summary")) || summary}
      </DeliverableCard>
      <DeliverableCard title="Bottleneck analysis">
        {cleanLabel(get("Bottleneck analysis")) || summary}
      </DeliverableCard>
      <DeliverableCard title="Prioritized improvements">
        {plan?.length ? (
          <div className="space-y-2">
            {plan.map((item, i) => (
              <div key={i} className="rounded-lg bg-white/[.04] p-3">
                <p>{displayValue(item.action || item.description)}</p>
                <p className="mt-1 text-xs text-cyan-200">
                  {item.owner || "Owner pending"} ·{" "}
                  {item.due_date || "Due date pending"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          cleanLabel(get("Prioritized improvements")) ||
          "No prioritized improvements were returned."
        )}
      </DeliverableCard>
      <DeliverableCard title="Executive report">
        {cleanLabel(get("Executive report")) || summary}
      </DeliverableCard>
    </div>
  );
}
