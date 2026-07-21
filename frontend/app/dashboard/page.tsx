"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
const API = "/backend";
const details: Record<string, string> = {
  Recruiter: "Analyze resumes, screen candidates, and deliver hiring reports.",
  Support: "Classify tickets, search knowledge, and resolve customer issues.",
  Sales: "Qualify leads, draft outreach, and update the CRM simulation.",
  Marketing: "Create campaigns, content variants, and performance projections.",
  Operations:
    "Extract KPIs, identify bottlenecks, and prepare executive reports.",
};
type Employee = { id: string; name: string; role: string; department: string };
export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`${API}/api/employees`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok || !Array.isArray(payload)) {
          throw Error("Your employee list could not be loaded. Please sign in again.");
        }
        return payload as Employee[];
      })
      .then((items) => setEmployees(items.filter((employee) => details[employee.role])))
      .catch((cause) => {
        setEmployees([]);
        setError(
          cause instanceof Error
            ? cause.message
            : "Your employee list could not be loaded.",
        );
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <main id="employees" className="aurora min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-medium text-cyan-200">Your workforce</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-[-.04em]">
            Employees to hire.
          </h1>
          <p className="mt-3 max-w-xl leading-7 text-slate-400">
            Choose from five proven AI employees. Each has an independent
            editable workflow.
          </p>
        </motion.div>
        <div className="glass mt-9 flex items-center gap-4 rounded-2xl p-4">
          <span className="rounded-xl bg-violet-300/10 p-2 text-violet-200">
            <Sparkles size={18} />
          </span>
          <p className="text-sm text-slate-300">
            Every employee begins with its own published v1 and editable Draft
            workflow.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass h-72 animate-pulse rounded-2xl" />
              ))
            : employees.map((employee, index) => (
                <motion.article
                  key={employee.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:border-cyan-200/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-300/25 to-cyan-300/10 text-lg font-semibold text-cyan-100">
                      {employee.role[0]}
                    </div>
                    <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                      Ready
                    </span>
                  </div>
                  <p className="mt-7 text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                    {employee.department}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {employee.name}
                  </h2>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                    {details[employee.role]}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-slate-500">
                      Default workflow v1
                    </span>
                    <Link
                      href={`/employees/${employee.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-200"
                    >
                      Hire & manage <ArrowUpRight size={15} />
                    </Link>
                  </div>
              </motion.article>
            ))}
        </div>
        {!loading && error && (
          <div className="glass mt-6 rounded-2xl border border-rose-300/20 p-5 text-sm text-rose-100">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}
