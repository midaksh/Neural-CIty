import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComparePageContent } from "@/components/compare/ComparePageContent";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";

export default function ComparePage() {
  return (
    <DashboardLayout>
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <Suspense fallback={null}>
          <ComparePageContent />
        </Suspense>
      </main>
      <Footer />
      <FloatingChatButton />
    </DashboardLayout>
  );
}
