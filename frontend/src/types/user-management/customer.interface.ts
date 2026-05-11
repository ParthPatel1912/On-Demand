import { BookingStatus, PaymentMethod, PaymentStatus } from "@/types/bookingManagement.interface";
import { type IPagination, type ISortProps } from "../common.interface";

export interface ICustomer {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  mobileNumber: string | null;
  role: string;
  isActive: boolean;
  totalBookings: number;
  pendingBookings: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IFilterState extends Pick<IPagination, "limit">, ISortProps {
  status: string;
  minBookings?: number;
  maxBookings?: number;
  page: number;
}

export interface IBooking {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  assignedExpert?: {
    id: number;
    name: string;
    profileImage: string;
    isVerified: boolean;
    role: string;
    mobile_number: string;
  };
  serviceAddress: string;
  dateTime: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface IBookingFilter extends Pick<IPagination, "limit" | "currentPage">, ISortProps {
  serviceType?: string;
  date: string;
  time: string;
  minAmount: number;
  maxAmount: number;
  paymentMethod?: string;
  status: string;
  totalItems: number;
}

export interface IModalState {
  isOpen: boolean;
  type: "delete" | "status_change" | "add" | null;
  customerId: number | null;
  customerName?: string;
  targetStatus?: "Active" | "Blocked";
}

export interface ICustomerDetail {
  id: number;
  name: string;
  mobileNumber: string;
  email: string;
  isActive: boolean;
}
