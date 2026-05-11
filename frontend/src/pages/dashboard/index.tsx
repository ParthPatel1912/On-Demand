import { useEffect, useState } from "react";

import { fetchDashboardOverview } from "@/api/dashboard";
import type {
  IDashboardOverviewMultiPeriodData,
  Period,
} from "@/types/dashboard.interface";
import StatKpiGrid from "@/components/dashboard/StatKpiGrid";
import TopServicesCard from "@/components/dashboard/TopServicesCard";
import RevenueOverviewCard from "@/components/dashboard/RevenueOverviewCard";
import TopCitiesCard from "@/components/dashboard/TopCitiesCard";
import TopPartnersCard from "@/components/dashboard/TopPartnersCard";
import {
  ChartCardSkeleton,
  StatKpiGridSkeleton,
  TopPartnersCardSkeleton,
  TopServicesCardSkeleton,
} from "@/components/dashboard/skeletons";
import { DASHBOARD_TEXT } from "@/constants/dashboard.text";
import PageTitle from "@/components/common/PageTitle";

const AdminDashboardPage = () => {
  const [topServicesPeriod, setTopServicesPeriod] = useState<Period>("week");
  const [revenuePeriod, setRevenuePeriod] = useState<Period>("week");
  const [topCitiesPeriod, setTopCitiesPeriod] = useState<Period>("week");
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] =
    useState<IDashboardOverviewMultiPeriodData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (isMounted) setIsLoading(true);
      try {
        const data = await fetchDashboardOverview();
        if (isMounted) {
          setOverview(data);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setOverview(null);
        }
        console.error(DASHBOARD_TEXT.failedToFetch, error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const topServicesOverview = overview?.topServices?.[topServicesPeriod];
  const revenueOverview = overview?.revenue?.[revenuePeriod];
  const topCitiesOverview = overview?.topCities?.[topCitiesPeriod];
  const topPartners = overview?.topPartners?.slice(0, 5);

  return (
    <div className="space-y-4 bg-surface-dashboard">
      <PageTitle title={DASHBOARD_TEXT.dashboard} className="mt-2 mb-1.5" />

      {isLoading || !overview ? (
        <StatKpiGridSkeleton />
      ) : (
        <StatKpiGrid
          cards={overview.kpis}
          comparisonLabel={overview.comparisonLabel}
        />
      )}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {isLoading || !topServicesOverview ? (
          <TopServicesCardSkeleton />
        ) : (
          <TopServicesCard
            period={topServicesPeriod}
            onPeriodChange={setTopServicesPeriod}
            data={topServicesOverview}
          />
        )}
        {isLoading || !revenueOverview ? (
          <ChartCardSkeleton title={DASHBOARD_TEXT.revenueOverview} />
        ) : (
          <RevenueOverviewCard
            period={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
            data={revenueOverview}
            currency={overview?.currency}
          />
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {isLoading || !topCitiesOverview ? (
          <ChartCardSkeleton title={DASHBOARD_TEXT.topCitiesByBookings} />
        ) : (
          <TopCitiesCard
            period={topCitiesPeriod}
            onPeriodChange={setTopCitiesPeriod}
            data={topCitiesOverview}
          />
        )}
        {isLoading || !topPartners ? (
          <TopPartnersCardSkeleton />
        ) : (
          <TopPartnersCard data={topPartners} />
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;
