import { DashboardNavbar } from "@/components/dashboard-navbar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardNavbar />
      {children}
    </>
  );
}
