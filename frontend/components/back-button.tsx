"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({
  fallback = "/dashboard",
  label = "Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() =>
        history.length > 1 ? router.back() : router.push(fallback)
      }
      className="btn-ghost"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
