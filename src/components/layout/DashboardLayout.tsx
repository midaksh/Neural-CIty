"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { CopyToast } from "@/components/export/CopyToast";
import { ExportShareProvider } from "@/context/ExportShareContext";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExportShareProvider>
      <div className="min-h-screen bg-app-shell">
        <Sidebar />
        <div className="flex min-h-screen flex-col lg:pl-[272px]">{children}</div>
        <CopyToast />
      </div>
    </ExportShareProvider>
  );
}
