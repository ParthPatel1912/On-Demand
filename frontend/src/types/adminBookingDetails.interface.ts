export type AdminBookingPaymentDetails = {
  paymentStatus?: string;
  paymentMethod?: string;
  paymentGateway?: string;
  transactionId?: string;
  paidAt?: string;
};

export type AdminBookingCharges = {
  servicePartnerCharges?: number;
  commissionAmount?: number;
  commissionPercent?: number;
  partnerPayout?: number;
  currency?: string;
};

export type AdminBookingPaymentSummary = {
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  paid?: number;
  currency?: string;
};

export type AdminBookingParty = {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
};

export type AdminBookingDetails = {
  bookingId: string;
  status?: string;
  serviceId?: string;
  serviceName?: string;
  serviceType?: string;
  scheduledAt?: string;
  createdAt?: string;
  cancellationReason?: string;
  customer?: AdminBookingParty;
  servicePartner?: AdminBookingParty;
  payment?: AdminBookingPaymentDetails;
  charges?: AdminBookingCharges;
  customerPayment?: AdminBookingPaymentSummary;
};

