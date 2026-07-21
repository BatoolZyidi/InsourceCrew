"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Bot } from "lucide-react";
import { DashboardNavbar } from "@/components/dashboard-navbar";
const API = "/backend";
type Employee = { id: string; name: string; role: string; department: string };
export default function Crew() {
  const [crew, setCrew] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}/api/my-crew`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then(setCrew)
      .finally(() => setLoading(false));
  }, []);
  return (
    <main className="aurora min-h-screen">
      <DashboardNavbar />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-medium text-cyan-200">My Crew</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">
          Published AI employees.
        </h1>
        <p className="mt-3 max-w-xl text-slate-400">
          Only employees with a Published workflow appear here. Draft changes do
          not affect live work.
        </p>
        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass h-52 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : crew.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {crew.map((employee, i) => (
              <motion.article
                key={employee.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-300/10 text-lg font-semibold text-emerald-100">
                    {employee.role[0]}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-200">
                    <Activity size={14} />
                    Live
                  </span>
                </div>
                <p className="mt-6 text-xs uppercase tracking-wider text-slate-500">
                  {employee.department}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{employee.name}</h2>
                <p className="mt-3 text-sm text-slate-400">
                  Published workflow is ready to accept inputs and run.
                </p>
                <Link
                  href={`/employees/${employee.id}/run`}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-200"
                >
                  Run employee <ArrowUpRight size={15} />
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="glass mt-8 rounded-2xl p-10 text-center">
            <Bot className="mx-auto text-slate-500" />
            <h2 className="mt-4 font-semibold">No published employees yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              Configure a Draft then Publish it to add it to My Crew.
            </p>
            <Link href="/dashboard#employees" className="btn-primary mt-6">
              Employees to hire
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
