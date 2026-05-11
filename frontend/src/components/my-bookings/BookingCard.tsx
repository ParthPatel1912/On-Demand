import { Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useState } from "react";
import { downloadBookingInvoice } from "@/api/booking";
import { format } from "date-fns";
import type { Booking } from "@/types/myBookings.interface";
import {
  Booking_primary_color,
  formatMinHrDuration,
  getBookingStatusStyle,
  getCurrencySymbol,
} from "@/utils";
import BookingDateBadge from "./BookingDateBadge";
import ServicePartnerInfo from "./ServicePartnerInfo";
import type { BookingStatus } from "@/utils/constants";
import { MY_BOOKINGS_TEXT } from "@/constants/myBookings.text";

interface BookingCardProps {
  booking: Booking;
}

const BookingCard = ({ booking }: BookingCardProps) => {
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const handleReceipt = async () => {
    if (!booking?.invoiceNumber) {
      toast.error(MY_BOOKINGS_TEXT.receiptNotAvailable);
      return;
    }
    setInvoiceLoading(true);

    try {
      const blob = await downloadBookingInvoice(booking.invoiceNumber);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${booking.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(MY_BOOKINGS_TEXT.invoiceSuccess);
    } catch (error) {
      console.error("Failed to download invoice", error);
      toast.error(MY_BOOKINGS_TEXT.invoiceFailed);
    } finally {
      setInvoiceLoading(false);
    }
  };
  const { className: statusClassName, label } = getBookingStatusStyle(
    booking.status as BookingStatus,
  );
  const date = new Date(booking.bookingDate);
  const day = format(date, "dd");
  const month = format(date, "MMM");
  return (
    <div className="relative pl-15">
      <div className="absolute left-0 top-0">
        <BookingDateBadge day={day} month={month} />
      </div>

      <div className="relative bg-white rounded-lg px-4 py-3 border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex-1 leading-5.25">
            <h3 className="text-ink-bookingPrimary text-base font-semibold line-clamp-2">
              {booking.serviceName}
            </h3>
            <p className="text-xs font-semibold text-gray-800 truncate">
              {formatMinHrDuration(Number(booking.duration))}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-1.25 rounded-full text-xs font-semibold whitespace-nowrap ${statusClassName}`}
            >
              {label}
            </span>

            <Button
              onClick={handleReceipt}
              disabled={!booking.invoiceNumber || invoiceLoading}
              className="inline-flex font-semibold items-center gap-1 bg-white border border-solid rounded-[200px] hover:bg-primary/10"
              style={{
                color: Booking_primary_color,
                padding: "5px 10px",
                height: "32px",
                minWidth: "108px",
                lineHeight: "1",
              }}
            >
              <Download size={13} />
              {invoiceLoading ? MY_BOOKINGS_TEXT.loadingReceipt : MY_BOOKINGS_TEXT.receiptBtn}
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 py-2 leading-5">
          <div className="flex gap-1 items-start">
            <MapPin
              width={13}
              height={13}
              className="text-gray-400 mt-0.5 shrink-0"
            />

            <p
              className="text-xs font-normal text-gray-500 line-clamp-2"
            >
              {booking.address}
            </p>
          </div>
          <p
            className="text-sm font-bold whitespace-nowrap"
          >
            <span className="text-ink-bookingPrimary">
              {getCurrencySymbol(booking.currency)}
            </span>&nbsp;
            {booking.amount}
          </p>
        </div>
        {/* Divider */}
        <div className="border-t-2 border-dashed border-gray-200 my-2" />
        {/* Partner */}
        <ServicePartnerInfo servicePartner={booking.servicePartner} />
      </div>
    </div>
  );
};

export default BookingCard;
