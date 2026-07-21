"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Sparkles } from "lucide-react";
const crew = [
  ["Recruiter", "Screens and ranks candidates", "R"],
  ["Support", "Resolves customer issues", "S"],
  ["Sales", "Finds and qualifies demand", "$"],
  ["Marketing", "Builds campaigns that convert", "M"],
  ["Operations", "Finds bottlenecks and improves work", "O"],
];
export default function Landing() {
  return (
    <main className="aurora min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-cyan-200 text-slate-950">
            IC
          </span>
          InsourceCrew
        </Link>
        <div className="flex gap-3">
          <Link className="btn-ghost" href="/login">
            Log in
          </Link>
          <Link className="btn-primary" href="/signup">
            Start building <ArrowRight size={16} />
          </Link>
        </div>
      </nav>
      <section className="grid-noise mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:pt-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-sm text-violet-100"
          >
            <Sparkles size={15} />
            The AI workforce platform
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-semibold leading-[.98] tracking-[-.06em] md:text-7xl"
          >
            Hire an{" "}
            <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-200 bg-clip-text text-transparent">
              AI Employee.
            </span>
            <br />
            Build your unfair advantage.
          </motion.h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
            Give your team intelligent teammates with transparent, editable
            workflows—from recruiting to operations.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary px-5 py-3">
              Hire your first employee <ArrowRight size={17} />
            </Link>
            <Link href="/guide" className="btn-ghost px-5 py-3">
              <BookOpen size={17} />
              View usage guide
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
            {[
              "Version-controlled workflows",
              "Auditable execution",
              "Your company context",
            ].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <Check size={16} className="text-cyan-200" />
                {t}
              </span>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-[28px] p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Your AI workforce</span>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              5 employees online
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {crew.map(([name, description, mark], i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-300/15 font-bold text-cyan-100">
                  {mark}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{name}</p>
                  <p className="mt-1 text-sm text-slate-400">{description}</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
