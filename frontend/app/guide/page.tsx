"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileUp,
  History,
  PlayCircle,
  Sparkles,
  UsersRound,
  Workflow,
} from "lucide-react";
import { DashboardNavbar } from "@/components/dashboard-navbar";

const steps = [
  {
    icon: Sparkles,
    title: "Choose an AI employee",
    copy: "Open Employees to hire, then choose Recruiter, Support, Sales, Marketing, or Operations. Each begins with a safe default workflow.",
  },
  {
    icon: Workflow,
    title: "Review and publish the workflow",
    copy: "Open the workflow canvas to inspect its steps, adjust node settings, save a draft, and Publish when you are ready for it to work.",
  },
  {
    icon: FileUp,
    title: "Upload your business input",
    copy: "Provide a real CSV, JSON, or TXT file. Recruiter uses a job description plus candidate resumes; every other employee accepts its relevant business file.",
  },
  {
    icon: PlayCircle,
    title: "Run and review the deliverable",
    copy: "Run the employee, follow its processing steps, and view the structured business result. Every run is retained in that employee's session history.",
  },
];

const roles = [
  [
    "Recruiter",
    "Job description + resumes",
    "Evidence, scores, ranking, hiring report",
  ],
  [
    "Support",
    "Support ticket",
    "Classification, reply, confidence, escalation",
  ],
  ["Sales", "Lead record", "Qualification, BANT, outreach, CRM summary"],
  [
    "Marketing",
    "Business goal or campaign brief",
    "Audience, campaign plan, content, calendar",
  ],
  [
    "Operations",
    "KPI or operations report",
    "KPIs, bottlenecks, improvements, executive report",
  ],
];

export default function UsageGuidePage() {
  return (
    <main className="aurora min-h-screen">
      <DashboardNavbar />
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm font-medium text-cyan-100">
            <BookOpen size={16} /> InsourceCrew usage guide
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Put your AI employees to work.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            InsourceCrew turns your business files into clear, reviewable work.
            You control every workflow before an employee runs.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, copy }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-300/15 text-violet-100">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-200">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{title}</h2>
                  <p className="mt-3 leading-7 text-slate-400">{copy}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <article className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200">
                <UsersRound size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-200">
                  From workflow to My Crew
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Publish to make an employee live.
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  1. Draft
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Edit nodes and settings safely. Draft changes do not run.
                </p>
              </div>
              <div className="rounded-2xl border border-violet-300/20 bg-violet-300/[.07] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                  2. Publish
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Publish the approved version when it is ready to work.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.07] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  3. My Crew
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Only published employees appear in My Crew and can be run.
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              Saving a Draft alone does not hire the employee. Open My Crew
              after publishing to find your live employees and start work.
            </p>
          </article>

          <article className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
                <History size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold text-cyan-200">
                  Keep control
                </p>
                <h2 className="text-xl font-semibold">Versions and sessions</h2>
              </div>
            </div>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-1 shrink-0 text-emerald-300"
                  size={15}
                />
                <span>
                  Every publish preserves the previous workflow as version
                  history. You can inspect or restore an older version to Draft.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-1 shrink-0 text-emerald-300"
                  size={15}
                />
                <span>
                  Every employee run is stored as a session. The newest session
                  opens first; open older sessions whenever you need to compare
                  results.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-1 shrink-0 text-emerald-300"
                  size={15}
                />
                <span>
                  Use clear source files with relevant fields. The employee
                  explains its result on screen; no external email, Slack, or
                  CRM access is needed for testing.
                </span>
              </li>
            </ul>
          </article>
        </section>

        <section className="glass mt-10 overflow-hidden rounded-3xl">
          <div className="border-b border-white/10 p-6 sm:p-8">
            <p className="text-sm font-semibold text-cyan-200">
              Choose the right employee
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Inputs and deliverables
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            {roles.map(([role, input, output]) => (
              <div
                key={role}
                className="grid gap-3 p-5 sm:grid-cols-[150px_1fr_1fr] sm:items-center sm:px-8"
              >
                <p className="font-semibold text-white">{role}</p>
                <p className="text-sm text-slate-400">
                  <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Input
                  </span>
                  {input}
                </p>
                <p className="text-sm text-slate-300">
                  <CheckCircle2
                    className="mr-2 inline text-emerald-300"
                    size={15}
                  />
                  {output}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-violet-300/15 bg-violet-300/[.07] p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">Ready to build your crew?</h2>
            <p className="mt-2 text-slate-400">
              Start by choosing one of the five built-in AI employees.
            </p>
          </div>
          <Link href="/dashboard#employees" className="btn-primary px-5 py-3">
            Explore employees <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
