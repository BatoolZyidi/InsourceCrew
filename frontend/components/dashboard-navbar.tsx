"use client";
import Link from "next/link";
import {
  BarChart3,
  LogOut,
  Menu,
  PlugZap,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
type User = { full_name: string; email: string; avatar_url?: string | null };
export function DashboardNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const raw = localStorage.getItem("current_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-transparent backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-semibold"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-cyan-200 text-slate-950">
            I
          </span>
          InsourceCrew
        </Link>
        <div className="relative">
          <button
            aria-label="Open navigation"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] hover:bg-white/[.08]"
          >
            <Menu size={19} />
          </button>
          {open && (
            <div className="glass absolute right-0 mt-3 w-72 rounded-2xl p-2 text-sm">
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[.04] p-3">
                {user?.avatar_url ? (
                  <img
                    src={`http://127.0.0.1:8000${user.avatar_url}`}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-300/15 text-violet-100">
                    <UserRound size={19} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {user?.full_name || "Your account"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email || "Personal settings"}
                  </p>
                </div>
              </div>
              <MenuLink
                href="/crew"
                icon={<UsersRound size={16} />}
                label="My Crew"
              />
              <MenuLink
                href="/dashboard#employees"
                icon={<UsersRound size={16} />}
                label="Employees to hire"
              />
              <MenuLink
                href="/integrations"
                icon={<PlugZap size={16} />}
                label="Integrations"
              />
              <MenuLink
                href="/analytics"
                icon={<BarChart3 size={16} />}
                label="Analytics"
              />
              <div className="my-2 border-t border-white/10" />
              <MenuLink
                href="/account"
                icon={<Settings size={16} />}
                label="Account settings"
              />
              <div className="my-2 border-t border-white/10" />
              <button
                onClick={() => {
                  localStorage.clear();
                  location.href = "/";
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-semibold text-rose-300 hover:bg-rose-400/10"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
function MenuLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:bg-white/[.06] hover:text-white"
    >
      {icon}
      {label}
    </Link>
  );
}
