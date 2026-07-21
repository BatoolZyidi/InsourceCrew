import { DeliverableCard } from "./shared";
import {
  cleanLabel,
  displayValue,
  highlights,
  text,
  type DeliverableOutput,
} from "./types";

function parse(value?: string): unknown {
  try {
    return value ? JSON.parse(value.replace(/^[^:]+:\s*/, "")) : undefined;
  } catch {
    return undefined;
  }
}

export function SupportDeliverable({ output }: { output: DeliverableOutput }) {
  const summary = text(output, "summary");
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((row) => row.toLowerCase().startsWith(key.toLowerCase()));
  const classification = parse(get("Ticket classification")) as
    | Record<string, unknown>
    | undefined;
  const resolution = parse(get("Resolution log")) as
    | Record<string, unknown>
    | undefined;
  const escalated = /high urgency|negative|immediate|angry/i.test(summary);
  const pdf = /pdf/i.test(summary);

  return (
    <div className="mt-5 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Ticket resolution report</h3>
        <p className="mt-1 text-sm text-slate-400">
          Classification, recommended reply, confidence, and final resolution.
        </p>
      </div>
      <DeliverableCard title="Ticket classification">
        {classification ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(classification).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-white/[.04] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                  {key}
                </p>
                <p className="mt-1">{displayValue(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          cleanLabel(get("Ticket classification")) || summary
        )}
      </DeliverableCard>
      <DeliverableCard title="Knowledge-base guidance">
        {cleanLabel(get("Knowledge-base guidance")) ||
          (pdf
            ? "Built-in dashboard PDF export is not currently available. Offer browser print-to-PDF or a custom PDF workflow."
            : "Use the relevant knowledge-base article and verified troubleshooting steps.")}
      </DeliverableCard>
      <DeliverableCard title="Draft customer reply">
        <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/25 p-4 leading-7">
          {cleanLabel(get("Response draft")) ||
            (pdf
              ? "Thanks for asking about PDF export. While there is no built-in export yet, we can help you use browser print-to-PDF or set up a custom workflow. I’ve recorded your request for our product team."
              : "Thanks for contacting support. We reviewed your request and will help with the best next step.")}
        </div>
      </DeliverableCard>
      <DeliverableCard title="Confidence">
        {cleanLabel(get("Confidence")) ||
          (/high confidence/i.test(summary)
            ? "High confidence"
            : "Confidence requires human review")}
      </DeliverableCard>
      <DeliverableCard title="Escalation decision">
        {cleanLabel(get("Escalation decision")) ||
          (escalated
            ? "Escalate to a human support manager."
            : "No escalation needed — send the auto-reply.")}
      </DeliverableCard>
      <DeliverableCard title="Resolution log">
        {resolution ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(resolution).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-white/[.04] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {key.replaceAll("_", " ")}
                </p>
                <p className="mt-1">{displayValue(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          cleanLabel(get("Resolution log")) || "Ticket outcome recorded."
        )}
      </DeliverableCard>
    </div>
  );
}
