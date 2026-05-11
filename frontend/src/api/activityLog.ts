import axiosInstance from "@/helper/axiosInstance";
import type { LogFilterParams } from "@/types/activity-logger.interface";

export const fetchActivityLog = async (params?: LogFilterParams) => {
  const response = await axiosInstance.get("/log", {
    params,
  });
  return response.data;
};

export const fetchLogEventTypes = async (category?: string) => {
  const response = await axiosInstance.get("/log/event-types", {
    params: { category },
  });
  return response.data;
};
