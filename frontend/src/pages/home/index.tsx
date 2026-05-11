import { lazy, Suspense, memo, useState, useEffect } from "react";
import HomePageSkeleton from "@/components/home/HomePageSkeleton";
import { getState } from "@/api/homeServices";

const HeroSection = lazy(() => import("@/components/home/HeroSection"));
const CategoriesSection = lazy(
  () => import("@/components/home/CategoriesSection")
);
const PopularServicesSection = lazy(
  () => import("@/components/home/PopularServiceSection")
);
const AllServicesSection = lazy(
  () => import("@/components/home/AllServicesSection")
);
const JoinPartnerSection = lazy(
  () => import("@/components/home/JoinPartnerSection")
);

export type StatsCount = {
  servicesCount: number;
  customersCount: number;
  servicesPartnerCount: number;
};

const HomePage = memo(() => {
  const [stats, setStats] = useState<StatsCount>({
    servicesCount: 0,
    customersCount: 0,
    servicesPartnerCount: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await getState();
      const data: StatsCount = {
        servicesCount: res.servicesCount,
        customersCount: res.customersGlobally,
        servicesPartnerCount: res.servicesPartnerCount,
      };
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <main className="flex-1">
      <Suspense fallback={<HomePageSkeleton />}>
        <HeroSection
          customersCount={stats.customersCount}
          servicesCount={stats.servicesCount}
        />
        <CategoriesSection />
        <PopularServicesSection />
        <AllServicesSection />
        <JoinPartnerSection partnerCount={stats.servicesPartnerCount} />
      </Suspense>
    </main>
  );
});

export default HomePage;
