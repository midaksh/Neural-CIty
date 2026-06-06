import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";
import { DataSourcesPageContent } from "@/components/data-sources/DataSourcesPageContent";

export default function DataSourcesPage() {
  return (
    <DashboardLayout>
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <DataSourcesPageContent />
      </main>
      <Footer />
      <FloatingChatButton />
    </DashboardLayout>
  );
}
