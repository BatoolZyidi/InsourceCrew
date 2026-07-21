"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

const API = "/backend";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.detail || "We couldn't sign you in.");
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("current_user", JSON.stringify(data.user));
      router.push("/crew");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aurora grid min-h-screen place-items-center px-5">
      <div className="glass w-full max-w-md rounded-[28px] p-7 sm:p-9">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-cyan-200 text-slate-950">
            IC
          </span>
          InsourceCrew
        </Link>
        <div className="mt-10">
          <span className="inline-flex rounded-lg bg-white/5 p-2 text-cyan-200">
            <LockKeyhole size={18} />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-2 leading-6 text-slate-400">
            Your AI workforce is ready when you are.
          </p>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field
            label="Work email"
            name="email"
            type="email"
            placeholder="maya.chen@acme.com"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
          />
          <p className="text-xs text-slate-400">
            Demo account: maya.chen@acme.com / AcmeDemo!2026
          </p>
          {error && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
              {error}
            </p>
          )}
          <button disabled={loading} className="btn-primary mt-2 w-full py-3">
            {loading ? "Signing in…" : "Enter InsourceCrew"}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-400">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-white">
            Create your workspace
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </span>
      <input
        required
        {...props}
        className="w-full rounded-xl border border-white/10 bg-white/[.045] px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/60"
      />
    </label>
  );
}
