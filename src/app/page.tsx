import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { RankingsTable } from "@/components/rankings/RankingsTable";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <RankingsTable />
      </main>
      <Footer />
      <FloatingChatButton />
    </>
  );
}
