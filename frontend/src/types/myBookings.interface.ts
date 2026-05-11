import type { IPagination } from "./common.interface";

export type StatusStyle = { bg: string; text: string; label: string };

export type BookingTab = "UPCOMING" | "COMPLETED";

export interface MyBookingsQuery {
  userId?: number;
  tab?: BookingTab;
  page?: number;
  limit?: number;
}

export interface BookingPartner {
  id: number;
  name: string;
  mobileNumber: string;
  countryCode: string;
  profileImage: string | null;
  verificationStatus: string;
  serviceType: {
    id: number;
    name: string;
  };
}

export interface Booking {
  id: number;
  serviceName: string;
  duration: string;
  bookingDate: string;
  address: string;
  amount: number;
  currency: string;
  status: string;
  invoiceNumber: string | null;
  invoiceDownloadUrl: string | null;
  servicePartner: BookingPartner | null;
}

export interface BookingListResponse {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
    pagination: IPagination;
  };
}
