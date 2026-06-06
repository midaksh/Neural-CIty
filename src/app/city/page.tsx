import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";
import { CityDetailsPageContent } from "@/components/city-detail/CityDetailsPageContent";

export default function CityDetailsPage() {
  return (
    <DashboardLayout>
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <CityDetailsPageContent />
      </main>
      <Footer />
      <FloatingChatButton />
    </DashboardLayout>
  );
}
