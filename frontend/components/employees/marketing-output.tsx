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
export function MarketingOutput({ output }: { output: DeliverableOutput }) {
  const rows = highlights(output);
  const get = (key: string) =>
    rows.find((x) => x.toLowerCase().startsWith(key.toLowerCase()));
  const brief = parse(get("Campaign brief")) as
    Record<string, unknown> | undefined;
  const calendar = parse(get("Content calendar")) as
    { date: string; content: string; channel: string }[] | undefined;
  const projection = parse(get("Performance projection")) as
    Record<string, unknown> | undefined;
  const concepts = rows.filter((x) => x.includes(" | "));
  return (
    <div className="mt-5">
      <h3 className="text-xl font-semibold">Marketing campaign workspace</h3>
      <DeliverableCard title="Campaign summary">
        {text(output, "summary")}
      </DeliverableCard>
      <DeliverableCard title="Audience definition">
        {get("Audience definition") || "Audience data was not returned."}
      </DeliverableCard>
      <DeliverableCard title="Campaign brief">
        {brief ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(brief).map(([k, v]) => (
              <p key={k}>
                <b className="capitalize text-cyan-200">
                  {k.replaceAll("_", " ")}:{" "}
                </b>
                {Array.isArray(v) ? v.join(" · ") : String(v)}
              </p>
            ))}
          </div>
        ) : (
          get("Campaign brief") || "Campaign brief was not returned."
        )}
      </DeliverableCard>
      <DeliverableCard title="Content variants">
        {concepts.map((x, i) => (
          <p key={i} className="mt-2 rounded-lg bg-white/[.04] p-2">
            {x}
          </p>
        ))}
      </DeliverableCard>
      <DeliverableCard title="Content calendar">
        {calendar?.map((item, i) => (
          <div key={i} className="mt-2 border-l-2 border-violet-300 pl-3">
            <b className="text-cyan-200">{item.date}</b> · {item.channel}
            <p>{item.content}</p>
          </div>
        )) || get("Content calendar")}
      </DeliverableCard>
      <DeliverableCard title="Performance projection">
        {projection ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(projection).map(([k, v]) => (
              <p key={k}>
                <b className="capitalize text-emerald-200">
                  {k.replaceAll("_", " ")}:{" "}
                </b>
                {String(v)}
              </p>
            ))}
          </div>
        ) : (
          get("Performance projection")
        )}
      </DeliverableCard>
    </div>
  );
}
