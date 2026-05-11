export const PaymentMethod = {
  CASH: "CASH",
  CARD: "CARD",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Cash",
  [PaymentMethod.CARD]: "Card",
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.CANCELLED]: "Cancelled",
  [BookingStatus.COMPLETED]: "Completed",
};

export function getPaymentMethodLabel(method: PaymentMethod | string) {
  if (method in PAYMENT_METHOD_LABEL) {
    return PAYMENT_METHOD_LABEL[method as PaymentMethod];
  }
  return method;
}

export function getBookingStatusLabel(status: BookingStatus | string) {
  if (status in BOOKING_STATUS_LABEL) {
    return BOOKING_STATUS_LABEL[status as BookingStatus];
  }
  return status;
}

export type BookingDetail = {
  bookingId: string;
  serviceId: string;
  service: string;
  serviceType: string;
  dateTime: string;
  assignedExpert: string;
  assignedExpertId?: number;
  assignedExpertAvatar?: string;
  assignedExpertMobileNumber?: string;
  status: BookingStatus;
  cancellationReason?: string;
};

export type BookingCustomerRow = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  totalBookings: number;
  address: string;
  lastBookingDate: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  details: BookingDetail[];
};

export interface Expert {
  id: number;
  name: string;
  avatar?: string;
  role: string;
  verified?: boolean;
}
