export type Period = "week" | "month" | "year";

export interface IDashboardKpi {
  key:
    | "bookings"
    | "users"
    | "partners"
    | "revenue"
    | "active_services"
    | "completed_services"
    | "future_bookings";
  title: string;
  value: string;
  change: string;
  changePercent: number;
  positive: boolean;
  iconKey: "calendar" | "users" | "wrench" | "dollar" | "badge-check";
}

export interface IDashboardService {
  label: string;
  value: number;
  color: string;
}

export interface IDashboardRevenueBar {
  label?: string;
  day?: string;
  amount: number;
}

export interface IDashboardCitySeries {
  name: string;
  color: string;
  data: number[];
}

export interface IDashboardPartner {
  name: string;
  role: string;
  completed: number;
  avatar: string | null;
}

export interface IDashboardOverviewData {
  currency?: string;
  period: Period;
  comparisonLabel: string;
  kpis: IDashboardKpi[];
  topServices: {
    totalBookings: number;
    services: IDashboardService[];
  };
  revenue: {
    bars: IDashboardRevenueBar[];
    yTicks: number[];
    yTickLabels: string[];
  };
  topCities?: {
    xLabels: string[];
    series: IDashboardCitySeries[];
    yTicks: number[];
  };
  topPartners?: IDashboardPartner[];
  topRevenueServices?: {
    totalBookings: number;
    services: IDashboardService[];
  };
}

export interface IDashboardOverviewMultiPeriodData {
  currency: string;
  comparisonLabel: string;
  kpis: IDashboardKpi[];
  topPartners: IDashboardPartner[];
  topServices: Record<Period, IDashboardOverviewData["topServices"]>;
  revenue: Record<Period, IDashboardOverviewData["revenue"]>;
  topCities: Record<Period, NonNullable<IDashboardOverviewData["topCities"]>>;
}

export interface IServicePartnerDashboardMultiPeriodData {
  currency: string;
  comparisonLabel: string;
  kpis: IDashboardKpi[];
  topServices: Record<Period, IDashboardOverviewData["topServices"]>;
  revenue: Record<Period, IDashboardOverviewData["revenue"]>;
  topRevenueServices: Record<
    Period,
    NonNullable<IDashboardOverviewData["topRevenueServices"]>
  >;
}

export interface IServicePie {
  name: string;
  value: number;
  fill: string;
}

export type ITopServicesProps = {
  title?: string;
  isRevenueServices?: boolean;
  period: Period;
  onPeriodChange: (period: Period) => void;
  data?: IDashboardOverviewData["topServices"];
};

export interface ITopCitiesProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  data?: IDashboardOverviewData["topCities"];
}

export interface IRevenueOverviewProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  data?: IDashboardOverviewData["revenue"];
}

export type StatCardData = {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  iconKey: "calendar" | "users" | "wrench" | "dollar" | "badge-check";
};
