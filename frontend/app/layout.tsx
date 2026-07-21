import "./globals.css";
import type { Metadata } from "next";
import { SessionExpiryGuard } from "@/components/session-expiry-guard";
import { ContextBackButton } from "@/components/context-back-button";
export const metadata: Metadata = {
  title: "InsourceCrew",
  description: "Build your AI workforce",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionExpiryGuard />
        <ContextBackButton />
        {children}
      </body>
    </html>
  );
}
