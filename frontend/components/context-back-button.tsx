"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const ROOT_PAGES = new Set([
  "/",
  "/login",
  "/signup",
  "/dashboard",
  "/employees",
  "/crew",
]);

export function ContextBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  if (ROOT_PAGES.has(pathname) || /^\/employees\/[^/]+$/.test(pathname))
    return null;
  return (
    <button
      onClick={() =>
        history.length > 1 ? router.back() : router.push("/dashboard")
      }
      className="fixed left-5 top-24 z-50 btn-ghost"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
