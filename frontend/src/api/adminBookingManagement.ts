import axiosInstance from "@/helper/axiosInstance";
import type {
  BookingCustomerRow,
  BookingStatus,
  PaymentMethod,
} from "@/types/bookingManagement.interface";
import type { IPagination } from "@/types/common.interface";
import type { AdminBookingDetails } from "@/types/adminBookingDetails.interface";
import type {
  BookingListResponse,
  MyBookingsQuery,
} from "@/types/myBookings.interface";

export type AdminBookingListResponse = {
  data: BookingCustomerRow[];
  pagination: IPagination;
};

export type AdminBookingFilterResponse = {
  serviceTypes: string[];
  paymentMethods: PaymentMethod[];
  bookingStatuses: BookingStatus[];
};

export const getAdminBookingFilters = async () => {
  const res = await axiosInstance.get("/admin-bookings/filters");
  return res.data as { success: boolean; data: AdminBookingFilterResponse };
};

export const getAdminBookings = async (params: {
  page: number;
  limit: number;
  q?: string;
  serviceType?: string;
  date?: string;
  time?: string;
  bookedMin?: number;
  bookedMax?: number;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: PaymentMethod;
  status?: BookingStatus;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  const res = await axiosInstance.get("/admin-bookings", { params });
  return res.data as {
    success: boolean;
    data: BookingCustomerRow[];
    pagination: AdminBookingListResponse["pagination"];
  };
};

export const updateAdminBookingStatus = async (payload: {
  bookingId: string | number;
  status: BookingStatus | string;
  cancellationReason?: string;
}) => {
  const body: { status: string; cancellationReason?: string } = {
    status: payload.status,
  };
  if (payload.cancellationReason) {
    body.cancellationReason = payload.cancellationReason;
  }

  const res = await axiosInstance.patch(
    `/admin-bookings/${payload.bookingId}/status`,
    body
  );
  return res.data;
};

export const deleteAdminBooking = async (bookingId: string | number) => {
  const res = await axiosInstance.delete(`/admin-bookings/${bookingId}`);
  return res.data;
};

export const changeAdminBookingExpert = async (payload: {
  bookingId: string | number;
  servicePartnerId: number;
}) => {
  const res = await axiosInstance.patch(
    `/admin-bookings/${payload.bookingId}/expert`,
    { servicePartnerId: payload.servicePartnerId }
  );
  return res.data;
};

export type ExpertListItem = {
  id: number;
  name: string;
  avatar?: string;
  verified?: boolean;
};

export const getExpertsByServiceType = async (booking_id: string) => {
  const res = await axiosInstance.get("/admin-bookings/experts", {
    params: { booking_id },
  });
  return res.data as { success: boolean; data: ExpertListItem[] };
};

export const myBookingsServicesAPI = async (
  payload: MyBookingsQuery
): Promise<BookingListResponse> => {
  const response = await axiosInstance.post("bookings/my-bookings", payload);
  return response.data;
};

export const getAdminBookingDetails = async (bookingId: string | number) => {
  const res = await axiosInstance.get(`/admin-bookings/${bookingId}`);
  return res.data as { success: boolean; data: AdminBookingDetails };
};

export const getAdminBookingDetailsPageData = async (params: {
  bookingId: string | number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  const { bookingId, ...query } = params;
  const res = await axiosInstance.get(`/admin-bookings/${bookingId}/page-data`, {
    params: query,
  });
  return res.data as {
    success: boolean;
    data?: {
      logs?: unknown[];
      logsPagination?: {
        totalItems?: number;
        currentPage?: number;
        totalPages?: number;
        limit?: number;
      };
    };
    errors?: Partial<Record<"details" | "logs", string>>;
  };
};