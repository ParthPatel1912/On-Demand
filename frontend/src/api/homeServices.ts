import axiosInstance from "@/helper/axiosInstance";
import type { IHomePublicStats, Service } from "@/types/service.interface";

export type HomeServiceType = {
  id: number;
  name: string;
  image: string;
};

export type HomeService = {
  id: number;
  name: string;
  price: string;
  image: string;
};

const formatPrice = (price: string) => {
  const p = price?.toString().trim() ?? "";
  if (!p) return "";
  return p.startsWith("$") ? p : `$${p}`;
};

export { formatPrice };

export const fetchHomeServiceTypes = async () => {
  const response = await axiosInstance.get("home/service-types");
  return response.data.data as HomeServiceType[];
};

export const fetchPopularServices = async (limit = 10) => {
  const response = await axiosInstance.get("home/services/popular", {
    params: { limit },
  });
  return response.data.data as HomeService[];
};

export const fetchAllServices = async (limit = 12) => {
  const response = await axiosInstance.get("home/services/all", {
    params: { limit },
  });
  return response.data.data as HomeService[];
};

export const searchServices = async (q: string, limit = 12) => {
  const response = await axiosInstance.get("home/services/search", {
    params: { q, limit },
  });
  return response.data.data as HomeService[];
};

export const getServiceById = async (serviceId: number) => {
  const response = await axiosInstance.get(`/services/${serviceId}`);
  return response.data.data as Service;
};

export const getState = async () => {
  const response = await axiosInstance.get(`home/stats`);
  return response.data.data as IHomePublicStats;
};
