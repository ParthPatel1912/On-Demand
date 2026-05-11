import type { Address } from "@/api/customerAddress";
import type { ICoupon } from "../offers.interface";
import type { Dispatch, SetStateAction } from "react";

export type UserType = { name: string; email: string } | null;
export type AddressType = Address | null;
export type SlotType = { date: string; time: string } | null;

export type TPaymentMethod = "CARD" | "CASH";
export type TPaymentGateway = "STRIPE" | "RAZORPAY";

export interface IPaymentMethodValue {
  title: "Debit/Credit Card" | "Cash";
  value: TPaymentMethod;
}

export interface IPaymentGatewayValue {
  title: "Stripe" | "Razorpay";
  value: TPaymentGateway;
}

export interface IOtherSlotDetails {
  addressId: number;
  slot: SlotType;
  paymentMethod: string;
  paymentGateway: string;
}

export interface ILiftingSummaryType {
  finalAmount: number;
  appliedCoupon: ICoupon | null;
  tax: number;
  duration: number;
}

export interface ICheckoutPayload {
  userId: number;
  serviceId: number;
  addressId: number;
  slot: {
    date: string;
    time: string;
  };
  paymentMethod: string;
  paymentGateway?: string;
  couponId?: number;
  tax: number;
}

export interface IServiceManagement {
  id: number;
  name: string;
  categoryId: number;
  subCategoryId: number;
  price: string;
  duration: number;
  commission: string;
  availability: boolean;
  images: string[];
  cloudinaryIds: string[];
  includeServices: string[];
  excludeServices: string[];
  createdAt: string;
  updatedAt: string;
  subCategory?: {
    id: number;
    name: string;
  };
}

export interface ISlotResponseDataType {
  date: string;
  isFullyOccupied: boolean;
  times: { time: string; disabled: boolean }[];
}
export interface BookingSuccessData {
  bookingId: string;
  bookingStatus: string;
  headerTitle: string;
  serviceName: string;
  serviceDuration: string;
  assignmentStatus: "ASSIGNING_SERVICE_PARTNER" | "SERVICE_PARTNER_ASSIGNED";
  servicePartnerPhone: string;
  servicePartnerImage?: string;
  amountPaid: number;
  currency: string;
  invoiceNumber: string;
  invoiceDownloadUrl: string;
  selectedAddress: string;
  selectedDate: string;
  selectedTime: string;
  displayDateTime: string;
}

export type CheckoutStepProps = {
  duration: number;
  setOtherDetails: Dispatch<SetStateAction<IOtherSlotDetails>>;
  addressRefreshKey: number;
  onAddressRefresh: () => void;
};

export interface RetryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: IBookingPaymnet;
}

export interface IPayWithPolicyProps {
  serviceId: number;
  liftingSummary: ILiftingSummaryType;
  otherDetails: IOtherSlotDetails;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}

export interface IBookingPaymnet {
  id: number;
  userId: number;
  paymentId: number;
  serviceId: number;
  servicePartnerId: number;
  bookingDate: string;
  status: string;
  serviceDuration: number;
  expiresAt: string | null;
  cancellationReason: string | null;
  amount: number;
  payment: {
    slot: {
      date: string;
      time: string;
    };
    currency: string;
    addressId: number;
    paymentMethod: string;
    paymentGateway: string;
    paymentStatus: string;
    sessionId: string | null;
    orderId: string | null;
    paymentIntentId: string | null;
    clientSecret: string | null;
    couponId: number;
  };
}
