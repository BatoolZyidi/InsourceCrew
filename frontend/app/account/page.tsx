"use client";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { AlertTriangle, Camera, KeyRound, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
const API = "/backend";
type Profile = {
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
};
export default function Account() {
  const [p, setP] = useState<Profile>();
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState(false);
  useEffect(() => {
    fetch(`${API}/api/account/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then(setP);
  }, []);
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = new FormData(e.currentTarget).get("photo") as File;
    if (!file?.size) return;
    const body = new FormData();
    body.append("file", file);
    const r = await fetch(`${API}/api/account/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body,
    });
    if (r.ok) {
      const x = await r.json();
      setP(x);
      localStorage.setItem("current_user", JSON.stringify(x));
      setMsg("Profile photo uploaded.");
    } else setMsg("Upload a PNG, JPEG, or WEBP image.");
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch(`${API}/api/account/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ full_name: f.get("name"), phone: f.get("phone") }),
    });
    if (r.ok) {
      const x = await r.json();
      setP(x);
      localStorage.setItem("current_user", JSON.stringify(x));
      setMsg("Profile saved.");
    }
  }
  async function pass(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch(`${API}/api/account/password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_password: f.get("new"),
        confirm_password: f.get("confirm"),
      }),
    });
    setMsg(
      r.ok
        ? "Password updated."
        : "Passwords must match and be at least 12 characters.",
    );
  }
  return (
    <main className="aurora min-h-screen">
      <DashboardNavbar />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-cyan-200">Account</p>
        <h1 className="mt-1 text-4xl font-semibold">Personal settings</h1>
        {msg && (
          <p className="mt-5 rounded-xl bg-emerald-300/10 p-3 text-sm text-emerald-100">
            {msg}
          </p>
        )}
        <div className="mt-9 grid gap-5">
          <Panel icon={<Camera />} title="Profile photo">
            <form
              onSubmit={upload}
              className="flex w-full flex-wrap items-center gap-4"
            >
              {p?.avatar_url ? (
                <img
                  src={`${API}${p.avatar_url}`}
                  alt="Profile"
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-violet-300/15 text-violet-100">
                  <UserRound />
                </span>
              )}
              <input
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-300/15 file:px-3 file:py-2 file:text-violet-100"
              />
              <button className="btn-primary">Upload photo</button>
            </form>
          </Panel>
          <Panel icon={<UserRound />} title="Personal information">
            <form onSubmit={save} className="flex w-full flex-wrap gap-3">
              <input
                name="name"
                defaultValue={p?.full_name}
                placeholder="Full name"
                className="field"
              />
              <input
                value={p?.email || ""}
                disabled
                className="field cursor-not-allowed opacity-60"
              />
              <input
                name="phone"
                defaultValue={p?.phone || ""}
                placeholder="Phone number"
                className="field"
              />
              <button className="btn-primary">Save changes</button>
            </form>
          </Panel>
          <Panel icon={<KeyRound />} title="Password">
            <form onSubmit={pass} className="flex w-full flex-wrap gap-3">
              <input
                required
                minLength={12}
                name="new"
                type="password"
                placeholder="New password"
                className="field"
              />
              <input
                required
                minLength={12}
                name="confirm"
                type="password"
                placeholder="Rewrite new password"
                className="field"
              />
              <button className="btn-primary">Confirm password change</button>
            </form>
          </Panel>
          <Panel
            icon={<AlertTriangle className="text-rose-300" />}
            title="Delete account"
          >
            <button
              onClick={() => setModal(true)}
              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200"
            >
              Delete account
            </button>
          </Panel>
        </div>
      </section>
      {modal && <Delete close={() => setModal(false)} />}
    </main>
  );
}
function Delete({ close }: { close: () => void }) {
  const [x, setX] = useState("");
  async function remove() {
    const r = await fetch(`${API}/api/account/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confirmation: x }),
    });
    if (r.ok) {
      localStorage.clear();
      location.href = "/";
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <button onClick={close} className="float-right text-slate-400">
          <X />
        </button>
        <h2 className="text-xl font-semibold text-rose-100">
          Delete account permanently?
        </h2>
        <p className="mt-3 text-sm text-slate-400">Type DELETE to confirm.</p>
        <input
          value={x}
          onChange={(e) => setX(e.target.value)}
          className="field mt-5 w-full"
          placeholder="Type DELETE"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={close} className="btn-ghost">
            Cancel
          </button>
          <button
            disabled={x !== "DELETE"}
            onClick={remove}
            className="rounded-xl bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
          >
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}
function Panel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-white/5 p-2 text-cyan-200">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}
