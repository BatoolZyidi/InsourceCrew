// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { FileText, LoaderCircle, Play, Upload } from "lucide-react";
import { SessionHistory } from "@/components/session-history";
import { SalesOutput } from "@/components/employees/sales-output";
import { RecruiterOutput } from "@/components/employees/recruiter-output";
import { OperationsOutput } from "@/components/employees/operations-output";
import { SupportOutput } from "@/components/employees/support-output";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";
type Employee = { name: string; role: string; description: string };
type Log = {
  id: string;
  node_type: string;
  status: string;
  duration_ms?: number;
  output?: Record<string, unknown>;
};
type Run = { id: string; status: string; error?: string; logs?: Log[] };

const GUIDE: Record<string, { input: string; output: string }> = {
  Recruiter: {
    input: "Upload one job description and one or more candidate resumes.",
    output:
      "Resume evidence, skill extraction, match scores, candidate ranking, and a hiring report.",
  },
  Support: {
    input: "Upload a support ticket as CSV, JSON, or TXT.",
    output:
      "Ticket classification, knowledge-backed response draft, confidence, and escalation decision.",
  },
  Sales: {
    input: "Upload a lead record as CSV, JSON, or TXT.",
    output:
      "Lead qualification, BANT assessment, outreach draft, follow-up plan, and CRM summary.",
  },
  Marketing: {
    input: "Upload a business goal or campaign brief as CSV, JSON, or TXT.",
    output:
      "Audience definition, campaign brief, content variants, calendar, and projected results.",
  },
  Operations: {
    input:
      "Upload KPI, sales, ticket, or response-time report data as CSV, JSON, or TXT.",
    output:
      "KPI summary, bottleneck analysis, prioritized improvements, and executive report.",
  },
};

export default function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [employee, setEmployee] = useState<Employee>();
  const [file, setFile] = useState<File>();
  const [jobFile, setJobFile] = useState<File>();
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [run, setRun] = useState<Run>();
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    params.then(async ({ id: employeeId }) => {
      setId(employeeId);
      try {
        const response = await fetch(`${API}/api/employees/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!response.ok) throw new Error("Could not load this employee.");
        setEmployee(await response.json());
      } catch {
        setError(
          "The local backend is unavailable. Please refresh this page in a moment.",
        );
      }
    });
  }, [params]);

  const recruiter = employee?.role === "Recruiter";
  const guide = GUIDE[employee?.role || ""] || {
    input: "Upload local company data.",
    output: "A role-specific business deliverable.",
  };

  async function start() {
    setError("");
    setRun(undefined);
    setRunning(true);
    try {
      const token = localStorage.getItem("access_token");
      let response: Response;
      if (recruiter) {
        if (!jobFile || resumeFiles.length === 0)
          throw new Error(
            "Upload a job description and at least one resume before running Recruiter.",
          );
        response = await fetch(`${API}/api/employees/${id}/runs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              job_description: await jobFile.text(),
              resumes: await Promise.all(
                resumeFiles.map((item) => item.text()),
              ),
            },
          }),
        });
      } else {
        if (!file)
          throw new Error(
            "Upload a CSV, JSON, or TXT file before running this employee.",
          );
        const form = new FormData();
        form.append("file", file);
        response = await fetch(`${API}/api/employees/${id}/runs/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      }
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => ({}))).detail ||
            "Could not start this employee.",
        );
      setRun(await response.json());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not start this employee.",
      );
    } finally {
      setRunning(false);
    }
  }

  const output = run?.logs?.findLast(
    (item) => item.node_type === "output.dashboard",
  )?.output;
  return (
    <main className="aurora min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-cyan-200">
          {employee?.role || "AI employee"} workspace
        </p>
        <h1 className="mt-1 text-4xl font-semibold">
          Run {employee?.name || "employee"} with your input.
        </h1>
        <p className="mt-3 text-slate-400">
          {employee?.description ||
            "Upload company data and receive an on-screen deliverable."}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info title="This employee takes" text={guide.input} />
          <Info title="You will receive" text={guide.output} />
        </div>
        <section className="glass mt-6 rounded-2xl p-5">
          {recruiter ? (
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <UploadField
                label="Job description"
                multiple={false}
                onChange={(files) => setJobFile(files[0])}
                ready={jobFile?.name}
              />
              <UploadField
                label="Candidate resumes"
                multiple
                onChange={setResumeFiles}
                ready={
                  resumeFiles.length
                    ? `${resumeFiles.length} resume${resumeFiles.length > 1 ? "s" : ""} ready`
                    : undefined
                }
              />
              <RunButton running={running} onClick={start} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <UploadField
                label="Upload input file"
                multiple={false}
                onChange={(files) => setFile(files[0])}
                ready={file?.name}
              />
              <RunButton running={running} onClick={start} />
            </div>
          )}
        </section>
        {error && (
          <p className="mt-5 rounded-xl bg-rose-400/10 p-4 text-rose-200">
            {error}
          </p>
        )}
        {(run || running) && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <section className="glass rounded-2xl p-5">
              <h2 className="font-semibold">Processing steps</h2>
              {run?.logs?.map((item) => (
                <div
                  key={item.id}
                  className="mt-3 flex items-center gap-3 rounded-xl bg-white/[.04] p-3"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="flex-1">{item.node_type}</span>
                  <span className="text-xs text-slate-400">
                    {item.duration_ms || 0}ms
                  </span>
                </div>
              ))}
            </section>
            <section>
              <h2 className="font-semibold">Your business output</h2>
              {output ? (
                <Output output={output} />
              ) : (
                <p className="glass mt-4 rounded-2xl p-8 text-slate-400">
                  Your final deliverable will appear here automatically.
                </p>
              )}
            </section>
          </div>
        )}
        {id && <SessionHistory employeeId={id} refreshKey={run?.id} />}
      </div>
    </main>
  );
}
function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
        {title}
      </p>
      <p className="mt-2 text-sm text-slate-200">{text}</p>
    </div>
  );
}
function UploadField({
  label,
  multiple,
  onChange,
  ready,
}: {
  label: string;
  multiple: boolean;
  onChange: (files: File[]) => void;
  ready?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <input
        disabled={false}
        type="file"
        multiple={multiple}
        accept=".json,.csv,.txt"
        onChange={(event) => onChange(Array.from(event.target.files || []))}
        className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-300/15 file:px-3 file:py-2 file:text-cyan-100"
      />
      {ready && (
        <span className="mt-2 flex items-center gap-2 text-xs font-normal text-cyan-100">
          <Upload size={14} />
          {ready}
        </span>
      )}
    </label>
  );
}
function RunButton({
  running,
  onClick,
}: {
  running: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={running}
      onClick={onClick}
      className="btn-primary self-end disabled:opacity-60"
    >
      {running ? (
        <>
          <LoaderCircle className="animate-spin" size={16} />
          Processing…
        </>
      ) : (
        <>
          <Play size={16} />
          Run
        </>
      )}
    </button>
  );
}
function jsonValue(value?: string) {
  try {
    return value ? JSON.parse(value) : undefined;
  } catch {
    return undefined;
  }
}
function Output({ output }: { output: Record<string, unknown> }) {
  const highlights = (
    Array.isArray(output.highlights) ? output.highlights : []
  ).map(String);
  const title = String(output.title || "").toLowerCase();
  if (title.includes("recruiter")) return <RecruiterOutput output={output} />;
  if (title.includes("support")) return <SupportOutput output={output} />;
  if (title.includes("sales") || title.includes("lead qualification"))
    return <SalesOutput output={output} />;
  if (title.includes("operations")) return <OperationsOutput output={output} />;
  if (title.includes("marketing"))
    return <MarketingOutput output={output} highlights={highlights} />;
  return (
    <article className="glass mt-4 rounded-2xl p-6">
      <div className="flex gap-3">
        <FileText className="text-cyan-200" />
        <div>
          <p className="text-xs text-cyan-200">GPT-OSS DELIVERABLE</p>
          <h3 className="text-xl font-semibold">
            {String(output.title || "Business result")}
          </h3>
        </div>
      </div>
      <p className="mt-4 leading-7">{String(output.summary || "")}</p>
      {highlights.map((item, index) => (
        <p
          key={`${index}-${item.slice(0, 20)}`}
          className="mt-3 rounded-xl bg-white/[.04] p-3 text-sm"
        >
          {item}
        </p>
      ))}
    </article>
  );
}
function MarketingOutput({
  output,
  highlights,
}: {
  output: Record<string, unknown>;
  highlights: string[];
}) {
  const read = (label: string) =>
    highlights
      .find((item) => item.startsWith(`${label}:`))
      ?.slice(label.length + 1)
      .trim();
  const audience = jsonValue(read("Audience definition")) as
    Record<string, unknown> | undefined;
  const brief = jsonValue(read("Campaign brief")) as
    Record<string, unknown> | undefined;
  const calendar = jsonValue(read("Content calendar")) as
    | {
        week: string;
        activities: { date: string; concept: string; detail: string }[];
      }[]
    | undefined;
  const projection = jsonValue(read("Performance projection")) as
    Record<string, unknown> | undefined;
  const concepts = highlights
    .filter((item) => item.includes(" | "))
    .map((item) => {
      const [title, channels, detail, tags] = item.split(" | ");
      return { title, channels, detail, tags };
    });
  return (
    <article className="glass mt-4 overflow-hidden rounded-2xl">
      <header className="border-b border-white/10 bg-gradient-to-r from-fuchsia-400/10 via-violet-400/10 to-cyan-400/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-fuchsia-200">
          Campaign workspace
        </p>
        <h3 className="mt-1 text-2xl font-semibold">Marketing launch plan</h3>
        <p className="mt-3 leading-7 text-slate-300">
          {String(output.summary || "")}
        </p>
      </header>
      <div className="space-y-6 p-6">
        {audience && (
          <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[.06] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
              Target audience
            </p>
            <p className="mt-2 font-medium text-white">
              {String(audience.segment || "Defined audience")}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {String(audience.behaviors || "")}
              <br />
              {String(audience.pain_points || "")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.isArray(audience.industries) &&
                audience.industries.map((item) => (
                  <span
                    key={String(item)}
                    className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-xs text-cyan-100"
                  >
                    {String(item)}
                  </span>
                ))}
            </div>
          </section>
        )}
        {brief && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Campaign brief
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Metric label="Objective" value={brief.objective} />
              <Metric label="Key message" value={brief.key_message} />
              <Metric label="Tone" value={brief.tone} />
              <Metric
                label="Channels"
                value={
                  Array.isArray(brief.primary_channels)
                    ? brief.primary_channels.join(" · ")
                    : brief.primary_channels
                }
              />
            </div>
          </section>
        )}
        {concepts.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Content concepts
            </p>
            <div className="mt-3 grid gap-3">
              {concepts.map((concept) => (
                <div
                  key={concept.title}
                  className="rounded-xl border border-white/10 bg-white/[.035] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-white">{concept.title}</p>
                    <span className="text-xs text-fuchsia-200">
                      {concept.channels}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {concept.detail}
                  </p>
                  <p className="mt-3 text-xs text-cyan-200">{concept.tags}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {calendar && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Content calendar
            </p>
            <div className="mt-3 space-y-3">
              {calendar.map((week) => (
                <div
                  key={week.week}
                  className="rounded-xl border-l-2 border-violet-300 bg-white/[.035] p-4"
                >
                  <p className="text-sm font-semibold text-violet-100">
                    {week.week}
                  </p>
                  {week.activities?.map((activity) => (
                    <div
                      key={`${activity.date}-${activity.concept}`}
                      className="mt-3 grid gap-1 text-sm sm:grid-cols-[92px_1fr]"
                    >
                      <span className="text-cyan-200">{activity.date}</span>
                      <span className="text-slate-300">
                        <b className="text-white">{activity.concept}</b> —{" "}
                        {activity.detail}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
        {projection && (
          <section className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.06] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              Projected performance
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Metric
                label="Expected impressions"
                value={projection.impressions}
              />
              <Metric
                label="Engagement rate"
                value={projection.engagement_rate}
              />
              <Metric label="New followers" value={projection.new_followers} />
              <Metric
                label="CTA sign-ups"
                value={projection.email_signups_from_CTA}
              />
            </div>
            {projection.notes && (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {String(projection.notes)}
              </p>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
function Metric({ label, value }: { label: string; value: unknown }) {
  const text =
    typeof value === "object" && value !== null
      ? Object.entries(value as Record<string, unknown>)
          .map(([key, item]) => `${key}: ${item}`)
          .join(" · ")
      : String(value || "Not specified");
  return (
    <div className="rounded-xl bg-white/[.045] p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-5 text-slate-100">{text}</p>
    </div>
  );
}
