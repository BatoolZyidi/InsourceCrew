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
    return value ? JSON.parse(value.replace(/^[^:]+:\s*/, "")) : undefined;
  } catch {
    return undefined;
  }
}

function Details({ value }: { value: Record<string, unknown> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Object.entries(value).map(([key, item]) => (
        <div key={key} className="rounded-xl bg-white/[.04] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
            {key.replaceAll("_", " ")}
          </p>
          <p className="mt-1">{displayValue(item)}</p>
        </div>
      ))}
    </div>
  );
}

export function MarketingOutput({ output }: { output: DeliverableOutput }) {
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((row) => row.toLowerCase().startsWith(key.toLowerCase()));
  const audience = parse(get("Audience definition")) as Record<string, unknown> | undefined;
  const brief = parse(get("Campaign brief")) as Record<string, unknown> | undefined;
  const calendar = parse(get("Content calendar")) as unknown[] | undefined;
  const projection = parse(get("Performance projection")) as Record<string, unknown> | undefined;
  const concepts = rows.filter((row) => row.includes(" | "));

  return (
    <div className="mt-5 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Marketing campaign workspace</h3>
        <p className="mt-1 text-sm text-slate-400">
          Audience, campaign plan, content, calendar, and projected performance.
        </p>
      </div>
      <DeliverableCard title="Campaign summary">
        {text(output, "summary")}
      </DeliverableCard>
      <DeliverableCard title="Audience definition">
        {audience ? <Details value={audience} /> : cleanLabel(get("Audience definition")) || "Audience data was not returned."}
      </DeliverableCard>
      <DeliverableCard title="Campaign brief">
        {brief ? <Details value={brief} /> : cleanLabel(get("Campaign brief")) || "Campaign brief was not returned."}
      </DeliverableCard>
      <DeliverableCard title="Content variants">
        {concepts.length ? (
          <div className="space-y-2">
            {concepts.map((concept, index) => (
              <p key={`${concept}-${index}`} className="rounded-xl bg-white/[.04] p-3">
                {concept}
              </p>
            ))}
          </div>
        ) : (
          "No content variants were returned."
        )}
      </DeliverableCard>
      <DeliverableCard title="Content calendar">
        {calendar?.length ? (
          <div className="space-y-2">
            {calendar.map((item, index) => (
              <div key={index} className="border-l-2 border-violet-300 pl-3">
                {displayValue(item)}
              </div>
            ))}
          </div>
        ) : (
          cleanLabel(get("Content calendar")) || "No content calendar was returned."
        )}
      </DeliverableCard>
      <DeliverableCard title="Performance projection">
        {projection ? <Details value={projection} /> : cleanLabel(get("Performance projection")) || "No performance projection was returned."}
      </DeliverableCard>
    </div>
  );
}
