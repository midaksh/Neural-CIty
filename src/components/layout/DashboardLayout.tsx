import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app-shell">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-[272px]">{children}</div>
    </div>
  );
}
