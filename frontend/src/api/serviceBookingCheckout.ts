import axiosInstance from "@/helper/axiosInstance";
import type { ICheckoutPayload, TPaymentGateway, TPaymentMethod } from "@/types/service-checkout/serviceBooking.interface";

export const payForServiceBooking = async (payload: ICheckoutPayload) => {
  const res = await axiosInstance.post("/service-bookings/checkout", payload);
  return res.data.data;
};

export const getBookingWithPayment = async (bookingId: number) => {
  const res = await axiosInstance.get(`/service-bookings/checkout/${bookingId}`);
  return res.data.data;
};

export const retryBookingWithPayment = async ({bookingId, paymentMethod, paymentGateway}: {bookingId: number, paymentMethod: TPaymentMethod, paymentGateway?: TPaymentGateway}) => {
  const res = await axiosInstance.put(`/service-bookings/checkout/${bookingId}`,{
    bookingId,
    paymentMethod,
    paymentGateway,
  });
  return res.data.data;
};
