import { DeliverableCard } from "@/components/deliverables/shared";
import {
  highlights,
  text,
  type DeliverableOutput,
} from "@/components/deliverables/types";
const parse = (value?: string) => {
  try {
    return value ? JSON.parse(value.replace(/^[^:]+:\s*/, "")) : undefined;
  } catch {
    return undefined;
  }
};
export function RecruiterOutput({ output }: { output: DeliverableOutput }) {
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((x) => x.toLowerCase().startsWith(key.toLowerCase()));
  const summary = text(output, "summary");
  const scores = [
    ...summary.matchAll(
      /(RES-\d+)[^.]{0,240}?(?:match\s*\(?≈?|scoring\s+)(\d+)(?:%|\/100)/gi,
    ),
  ].map((x) => ({ id: x[1], score: x[2] }));
  const actions = parse(
    get("Prioritized improvements") || get("Hiring report"),
  ) as { action?: string; rationale?: string }[] | undefined;
  return (
    <div className="mt-5">
      <h3 className="text-xl font-semibold">Candidate evaluation report</h3>
      <DeliverableCard title="Resume evidence">
        {get("Resume evidence") || summary}
      </DeliverableCard>
      <DeliverableCard title="Skill extraction">
        {get("Skill extraction") ||
          "Skills, experience, and education were evaluated against the job description."}
      </DeliverableCard>
      <DeliverableCard title="Match scores and candidate ranking">
        {scores.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {scores
              .sort((a, b) => Number(b.score) - Number(a.score))
              .map((item, i) => (
                <div key={item.id} className="rounded-lg bg-white/[.04] p-3">
                  <p className="text-xs text-slate-400">Rank #{i + 1}</p>
                  <p className="font-semibold">{item.id}</p>
                  <p className="text-cyan-200">{item.score}/100 match</p>
                </div>
              ))}
          </div>
        ) : (
          "Candidate ranking was derived from evidence-based scores."
        )}
      </DeliverableCard>
      <DeliverableCard title="Hiring report and next actions">
        {actions?.length ? (
          <div className="space-y-2">
            {actions.map((item, i) => (
              <div key={i} className="rounded-lg bg-white/[.04] p-3">
                <p>{item.action}</p>
                <p className="mt-1 text-xs text-slate-300">{item.rationale}</p>
              </div>
            ))}
          </div>
        ) : (
          get("Hiring report") ||
          "Review the highest-ranked candidate and complete missing details."
        )}
      </DeliverableCard>
    </div>
  );
}
