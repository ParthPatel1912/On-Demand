import { useEffect, useState } from "react";

import { fetchServicePartnerDashboardOverview } from "@/api/dashboard";
import type {
  IServicePartnerDashboardMultiPeriodData,
  Period,
} from "@/types/dashboard.interface";
import StatKpiGrid from "@/components/dashboard/StatKpiGrid";
import TopServicesCard from "@/components/dashboard/TopServicesCard";
import RevenueOverviewCard from "@/components/dashboard/RevenueOverviewCard";
import {
  ChartCardSkeleton,
  StatKpiGridSkeleton,
  TopServicesCardSkeleton,
} from "@/components/dashboard/skeletons";
import { DASHBOARD_TEXT } from "@/constants/dashboard.text";
import PageTitle from "@/components/common/PageTitle";

const PartnerDashboardPage = () => {
  const [topServicesPeriod, setTopServicesPeriod] = useState<Period>("week");
  const [revenuePeriod, setRevenuePeriod] = useState<Period>("week");
  const [topRevenueServicesPeriod, setTopRevenueServicesPeriod] = useState<Period>("week");
  const [isLoading, setIsLoading] = useState(true);
  
  const [overview, setOverview] =
    useState<IServicePartnerDashboardMultiPeriodData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (isMounted) setIsLoading(true);
      try {
        const data = await fetchServicePartnerDashboardOverview();
        if (isMounted) {
          setOverview(data);
        }
      } catch (error) {
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
  const topRevenueServicesOverview =
    overview?.topRevenueServices?.[topRevenueServicesPeriod];

  return (
    <div className="space-y-4 bg-surface-dashboard">
      <PageTitle title={DASHBOARD_TEXT.dashboard} className="mt-2 mb-1.5" />

      {isLoading || !overview ? (
        <StatKpiGridSkeleton />
      ) : (
        <StatKpiGrid
          cards={overview.kpis}
          comparisonLabel={overview.comparisonLabel}
          column={4}
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
            currency={overview?.currency}
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
        {isLoading || !topRevenueServicesOverview ? (
          <ChartCardSkeleton title={DASHBOARD_TEXT.topRevenueServices} />
        ) : (
          <TopServicesCard
            isRevenueServices={true}
            title={DASHBOARD_TEXT.topRevenueServices}
            period={topRevenueServicesPeriod}
            onPeriodChange={setTopRevenueServicesPeriod}
            data={topRevenueServicesOverview}
            currency={overview?.currency}
          />
        )}
      </section>

    </div>
  );
};

export default PartnerDashboardPage;
