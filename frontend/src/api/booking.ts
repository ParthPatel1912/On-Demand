import axiosInstance from "@/helper/axiosInstance";
import type { BookingSuccessData } from "@/types/service-checkout/serviceBooking.interface";

export const getBookingSuccessDetails = async (bookingId: string) => {
  const res = await axiosInstance.get<{
    success: boolean;
    message: string;
    data: BookingSuccessData;
  }>(`/bookings/${bookingId}/success-details`);
  return res.data;
};

export const downloadBookingInvoice = async (
  invoiceNumber: string
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/bookings/invoice/${invoiceNumber}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};

export const getAvailableSlots = async (serviceId: number) => {
  const res = await axiosInstance.get(`/bookings/${serviceId}/available-slots`);
  return res.data;
};
