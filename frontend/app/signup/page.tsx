"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Signup() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.get("company"),
          admin_name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.detail || "We couldn't create the workspace.");
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
  const fields = [
    ["Company name", "company", "Acme Technologies", "text"],
    ["Your name", "name", "Maya Chen", "text"],
    ["Work email", "email", "you@company.com", "email"],
    ["Password", "password", "12+ characters", "password"],
  ];
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
        <h1 className="mt-10 text-3xl font-semibold tracking-tight">
          Create your AI workforce.
        </h1>
        <p className="mt-2 text-slate-400">
          Start with one employee. Scale to an entire crew.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-3">
          {fields.map(([label, name, placeholder, type]) => (
            <label key={name} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                {label}
              </span>
              <input
                required
                name={name}
                type={type}
                minLength={name === "password" ? 12 : undefined}
                placeholder={placeholder}
                className="w-full rounded-xl border border-white/10 bg-white/[.045] px-3.5 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-200/60"
              />
            </label>
          ))}
          {error && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
              {error}
            </p>
          )}
          <button disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Creating…" : "Create workspace"}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-400">
          Already have a workspace?{" "}
          <Link href="/login" className="font-semibold text-white">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
