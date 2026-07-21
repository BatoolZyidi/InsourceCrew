import type { ReactNode } from "react";
export function DeliverableCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-3 rounded-xl border border-white/10 bg-white/[.05] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
        {title}
      </p>
      <div className="mt-2 text-sm leading-6 text-slate-200">{children}</div>
    </section>
  );
}
