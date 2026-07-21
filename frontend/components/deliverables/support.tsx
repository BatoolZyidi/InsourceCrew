import { DeliverableCard } from "./shared";
import { highlights, text, type DeliverableOutput } from "./types";
const parse = (value?: string) => {
  try {
    return value ? JSON.parse(value.replace(/^[^:]+:\s*/, "")) : undefined;
  } catch {
    return undefined;
  }
};
export function SupportDeliverable({ output }: { output: DeliverableOutput }) {
  const summary = text(output, "summary");
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((x) => x.toLowerCase().startsWith(key.toLowerCase()));
  const actions = parse(
    get("Prioritized improvements") || get("Resolution log"),
  ) as string[] | undefined;
  const escalated = /high urgency|negative|immediate|angry/i.test(summary);
  const pdf = /pdf/i.test(summary);
  return (
    <div className="mt-5">
      <h3 className="text-xl font-semibold">Ticket resolution report</h3>
      <DeliverableCard title="Ticket classification">
        {get("Ticket classification") || summary}
      </DeliverableCard>
      <DeliverableCard title="Knowledge-base guidance">
        {get("Knowledge-base guidance") ||
          (pdf
            ? "Built-in dashboard PDF export is not currently available. Offer browser print-to-PDF or a custom PDF workflow."
            : "Use the relevant knowledge-base article and verified troubleshooting steps.")}
      </DeliverableCard>
      <DeliverableCard title="Draft customer reply">
        {get("Response draft") ||
          (pdf
            ? "Thanks for asking about PDF export. While there is no built-in export yet, we can help you use browser print-to-PDF or set up a custom workflow. I’ve recorded your request for our product team."
            : "Thanks for contacting support. We reviewed your request and will help with the best next step.")}
      </DeliverableCard>
      <DeliverableCard title="Confidence">
        {get("Confidence") ||
          (/high confidence/i.test(summary)
            ? "High confidence"
            : "Confidence requires human review")}
      </DeliverableCard>
      <DeliverableCard title="Escalation decision">
        {get("Escalation decision") ||
          (escalated
            ? "Escalate to a human support manager."
            : "No escalation needed — send the auto-reply.")}
      </DeliverableCard>
      <DeliverableCard title="Resolution log">
        {actions?.length ? (
          <ul className="list-disc space-y-1 pl-5">
            {actions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        ) : (
          get("Resolution log") || "Ticket outcome recorded."
        )}
      </DeliverableCard>
    </div>
  );
}
