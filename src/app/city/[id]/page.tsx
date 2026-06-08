import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingChatButton } from "@/components/ui/FloatingChatButton";
import { CityDetailContent } from "@/components/city-detail/CityDetailContent";
import { getCityDetailData, getCityIds } from "@/lib/city-detail-data";

interface CityPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getCityIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: CityPageProps) {
  const { id } = await params;
  const data = getCityDetailData(id);
  if (!data) return { title: "City not found · Neural City" };

  return {
    title: `${data.cityName} · Neural City`,
    description: `Street intelligence profile for ${data.cityName}: safety, convenience, and governance scores. Export as PDF or CSV.`,
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { id } = await params;
  const data = getCityDetailData(id);

  if (!data) {
    notFound();
  }

  return (
    <DashboardLayout>
      <Header />
      <main className="flex-1 pt-2">
        <CityDetailContent data={data} />
      </main>
      <Footer />
      <FloatingChatButton />
    </DashboardLayout>
  );
}
