"use client";
import {
  Activity,
  Bot,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const nav = [
  { label: "Overview", icon: LayoutDashboard, href: "/", active: true },
  { label: "AI Employees", icon: Bot, href: "/employees" },
  { label: "Team", icon: Users, href: "#" },
  { label: "Activity", icon: Activity, href: "#" },
  { label: "Settings", icon: Settings, href: "#" },
];
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-r bg-white px-5 py-7">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-bold text-white">
            IC
          </div>
          <span className="font-semibold tracking-tight">InsourceCrew</span>
        </div>
        <nav className="space-y-1">
          {nav.map(({ label, icon: Icon, active, href }) => (
            <Link
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-emerald-50 font-medium text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}
              href={href}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>
        <header className="flex h-20 items-center justify-between border-b bg-white px-6 lg:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Organization
            </p>
            <h1 className="font-semibold">Acme Technologies</h1>
          </div>
          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
            Maya Chen <ChevronDown size={15} />
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
export function Metric({
  label,
  value,
  detail,
  delay,
}: {
  label: string;
  value: string;
  detail: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border bg-white p-5 shadow-sm"
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </motion.div>
  );
}
export function EmptyActivity() {
  return (
    <div className="grid min-h-52 place-items-center rounded-lg border border-dashed bg-slate-50">
      <div className="text-center">
        <Clock3 className="mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium">No activity yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Create an AI employee when you’re ready.
        </p>
      </div>
    </div>
  );
}
