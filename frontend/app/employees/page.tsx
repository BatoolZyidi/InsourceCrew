import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
const shells = [
  ["Recruiter", "HR", "Screen and coordinate exceptional candidates"],
  ["Sales", "Sales", "Qualify leads and keep opportunities moving"],
  ["Marketing", "Marketing", "Create campaigns with a consistent brand voice"],
  ["Support", "Support", "Resolve customer requests with empathy"],
  ["Operations", "Operations", "Keep internal processes dependable"],
];
export default function Employees() {
  return (
    <DashboardShell>
      <main className="px-6 py-9 lg:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">AI workforce</p>
            <h2 className="mt-1 text-3xl font-semibold">Employees</h2>
            <p className="mt-2 text-slate-500">
              Independent, versioned systems for every role.
            </p>
          </div>
          <button className="rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white">
            Create employee
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shells.map(([name, department, description], i) => (
            <Link
              href={`/employees/demo-${i}`}
              key={name}
              className="group rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 font-semibold text-emerald-700">
                  {name[0]}
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-slate-500">{department}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {description}
              </p>
              <p className="mt-5 text-sm font-medium text-emerald-700">
                Open workflow →
              </p>
            </Link>
          ))}
        </div>
      </main>
    </DashboardShell>
  );
}
