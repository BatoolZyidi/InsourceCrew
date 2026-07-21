import { DeliverableCard } from "@/components/deliverables/shared";
import {
  highlights,
  text,
  type DeliverableOutput,
} from "@/components/deliverables/types";

type Evidence = Record<string, string[]>;
type Skills = Record<string, string[]>;
type HiringDecision = Record<
  string,
  { recommendation?: string; justification?: string }
>;

function parseJson<T>(value?: string): T | undefined {
  if (!value) return undefined;

  const payload = value.replace(/^[^:]+:\s*/, "").trim();
  try {
    return JSON.parse(payload) as T;
  } catch {
    return undefined;
  }
}

function field(rows: string[], name: string) {
  return rows.find((row) => row.toLowerCase().startsWith(name.toLowerCase()));
}

export function RecruiterOutput({ output }: { output: DeliverableOutput }) {
  const rows = highlights(output);
  const summary = text(output, "summary");
  const evidence = parseJson<Evidence>(field(rows, "Resume evidence"));
  const skills = parseJson<Skills>(field(rows, "Skill extraction"));
  const hiring = parseJson<HiringDecision>(field(rows, "Hiring report"));
  const candidateIds = Array.from(
    new Set([
      ...Object.keys(evidence || {}),
      ...Object.keys(skills || {}),
      ...Object.keys(hiring || {}),
    ]),
  );

  return (
    <div className="mt-5 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Candidate evaluation report</h3>
        <p className="mt-1 text-sm text-slate-400">
          A structured assessment of every submitted candidate.
        </p>
      </div>

      <DeliverableCard title="Resume evidence">
        {evidence && candidateIds.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {candidateIds.map((candidate) => (
              <section
                key={candidate}
                className="rounded-xl border border-white/10 bg-slate-950/30 p-4"
              >
                <p className="font-semibold text-cyan-100">{candidate}</p>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-300">
                  {(evidence[candidate] || ["No resume evidence was returned."]).map(
                    (item, index) => (
                      <li key={`${candidate}-evidence-${index}`} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                        <span>{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          field(rows, "Resume evidence") || summary
        )}
      </DeliverableCard>

      <DeliverableCard title="Skill extraction">
        {skills && Object.keys(skills).length ? (
          <div className="flex flex-wrap gap-3">
            {Object.entries(skills).map(([candidate, candidateSkills]) => (
              <div
                key={candidate}
                className="min-w-52 rounded-xl border border-white/10 bg-white/[.035] p-3"
              >
                <p className="text-sm font-semibold text-slate-100">{candidate}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {candidateSkills.length ? (
                    candidateSkills.map((skill, index) => (
                      <span
                        key={`${candidate}-skill-${index}`}
                        className="rounded-full bg-violet-400/10 px-2 py-1 text-xs text-violet-100"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">No skills identified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          field(rows, "Skill extraction") ||
          "Skills, experience, and education were evaluated against the job description."
        )}
      </DeliverableCard>

      <DeliverableCard title="Match scores and candidate ranking">
        {candidateIds.length ? (
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {candidateIds.map((candidate, index) => (
              <li
                key={`${candidate}-rank`}
                className="rounded-xl border border-white/10 bg-white/[.035] p-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Candidate {index + 1}
                </p>
                <p className="mt-1 font-semibold text-slate-100">{candidate}</p>
                <p className="mt-1 text-sm text-cyan-200">
                  {hiring?.[candidate]?.recommendation || "Assessment complete"}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          "Candidate ranking was derived from evidence-based scores."
        )}
      </DeliverableCard>

      <DeliverableCard title="Hiring report and next actions">
        {hiring && Object.keys(hiring).length ? (
          <div className="space-y-2">
            {Object.entries(hiring).map(([candidate, decision]) => (
              <div
                key={candidate}
                className="rounded-xl border border-white/10 bg-white/[.035] p-4"
              >
                <p className="font-semibold text-slate-100">
                  {candidate}: {decision.recommendation || "Review required"}
                </p>
                {decision.justification && (
                  <p className="mt-1.5 text-sm leading-6 text-slate-300">
                    {decision.justification}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          field(rows, "Hiring report") ||
          "Review the highest-ranked candidate and complete missing details."
        )}
      </DeliverableCard>
    </div>
  );
}
