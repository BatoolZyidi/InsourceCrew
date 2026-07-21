"use client";

import { useEffect } from "react";

function expireSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("current_user");
  window.location.assign("/login?reason=session-expired");
}

export function SessionExpiryGuard() {
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { exp?: number };
      const remaining = (payload.exp ?? 0) * 1000 - Date.now();
      if (remaining <= 0) {
        expireSession();
        return;
      }
      const timer = window.setTimeout(expireSession, remaining + 100);
      return () => window.clearTimeout(timer);
    } catch {
      expireSession();
    }
  }, []);
  return null;
}
