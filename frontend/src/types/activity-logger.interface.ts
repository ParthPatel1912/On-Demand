import { type IPaginationProps, type ISortProps } from "./common.interface";

export interface LogItem {
  id: string;
  eventType: LogEventType;
  category: LogCategory;
  message: string;
  userId: string;
  serviceId: string;
  bookingId: string | null;
  status: LogStatus;
  metadata: LogMetadata;
  createdAt: string;
}

export type LogEventType =
  | "PAYMENT_SUCCESS"
  | "SERVICE_PROVIDER_ASSIGNED"
  | "PAYMENT_INITIATED"
  | "BOOK_SERVICE_CLICK";

export type LogCategory =
  | "PAYMENT"
  | "SERVICE_PROVIDER"
  | "BOOKING"
  | "SERVICE"
  | "CUSTOMER";

export type LogStatus = "SUCCESS" | "INITIATED" | "FAILED";

export interface LogFilterParams extends IPaginationProps, ISortProps {
  page?: number;
  limit?: number;
  eventType?: string | string[];
  category?: string;
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  userId?: string;
  bookingId?: string;
  serviceId?: string;
}

export interface LogMetadata {
  tax?: number;
  amount?: number;
  discount?: number;
  totalAmount?: number;
  userId?: number;
  addressId?: number;
  partnerId?: number;
  serviceId?: number;
  serviceName?: string;
  paymentMethod?: string;
  paymentGateway?: string;
  serviceAddress?: string;
  serviceDuration?: number;
  slot?: {
    date: string;
    time: string;
  };
}

export interface ActiveFilterBadgesProps {
  filters: LogFilterParams;
  onRemove: (key: keyof LogFilterParams) => void;
  onClearAll: () => void;
  getEventTypeName: (val: string) => string;
}

export type TSortOrder = "ASC" | "DESC";