import axiosInstance from "@/helper/axiosInstance";
import type {
  IDashboardOverviewMultiPeriodData,
  IServicePartnerDashboardMultiPeriodData,
} from "@/types/dashboard.interface";

export const fetchDashboardOverview = async () => {
  const response = await axiosInstance.get("/dashboard/overview");
  return response.data.data as IDashboardOverviewMultiPeriodData;
};

export const fetchServicePartnerDashboardOverview = async () => {
  const response = await axiosInstance.get("/dashboard/analytics");
  return response.data.data as IServicePartnerDashboardMultiPeriodData;
};
