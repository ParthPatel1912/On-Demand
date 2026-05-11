import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, BadgeCheck } from "lucide-react";
import { APP_ROUTES } from "@/routes/config";
import { Button } from "@/components/ui/button";
import {
  getBookingSuccessDetails,
  downloadBookingInvoice,
} from "@/api/booking";
import { getInitials, getCurrencySymbol } from "@/utils";
import { getCustomerToken } from "@/utils/auth";
import type {
  BookingSuccessState,
  DetailRowProps,
} from "@/types/address.interface";

import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";
import Logo from "@/components/common/Logo";

const AssigningSpinner = () => (
  <div className="flex flex-col items-center gap-2 py-4">
    <div className="w-8 h-8 rounded-full border-4 border-line border-t-primary animate-spin" />
    <p className="text-sm text-center font-normal leading-5 tracking-[0.25%] text-ink-muted">
      {CHECKOUT_CONST_TEXT.assigningPartenerText}
    </p>
  </div>
);

const DetailRow = ({ label, value }: DetailRowProps) => {
  const isAmount = label === CHECKOUT_CONST_TEXT.amountPaid;

  return (
    <div className="flex items-start justify-between py-4 border-b border-dashed border-line last:border-0">
      {/* Label */}
      <span className="text-sm w-40 font-medium leading-5 text-ink-muted">
        {label}
      </span>

      {/* Value */}
      <span
        className={`flex-1 leading-5 tracking-[0.1%] text-sm ${
          isAmount
            ? "font-semibold text-ink-heading"
            : "font-medium text-ink-mid"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const Success = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<BookingSuccessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    setLoading(true);
    try {
      const response = await getBookingSuccessDetails(bookingId);

      if (response.success) {
        setBooking(response.data);
      } else {
        toast.error(response.message || CHECKOUT_CONST_TEXT.failedToFetchBooking);
      }
    } catch (error: unknown) {
      console.error(CHECKOUT_CONST_TEXT.failedToFetchBooking, error);
      toast.error(CHECKOUT_CONST_TEXT.errorFetchingBooking);
    } finally {
      setLoading(false);
    }
  };

  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => {
    const token = getCustomerToken();

    if (!token) {
      navigate(APP_ROUTES.LOGIN, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) return;
    if (lastFetchedId.current === bookingId) return;
    if (!bookingId) return;

    fetchBookingDetails();
    lastFetchedId.current = bookingId;
  }, [bookingId]);

  const handleInvoice = async () => {
    if (!booking?.invoiceNumber) {
      toast.error(CHECKOUT_CONST_TEXT.invoiceNotAvailable);
      return;
    }

    setInvoiceLoading(true);

    try {
      const blob = await downloadBookingInvoice(booking.invoiceNumber);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${CHECKOUT_CONST_TEXT.invoice}-${booking.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(CHECKOUT_CONST_TEXT.invoiceSuccess);
    } catch (error) {
      console.error(CHECKOUT_CONST_TEXT.failedToDownloadInvoice, error);
    } finally {
      setInvoiceLoading(false);
    }
  };
  const handleMyBookings = () => {
    navigate(APP_ROUTES.MY_BOOKINGS);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-line border-t-primary animate-spin" />
          <p className="text-ink-muted">
            {CHECKOUT_CONST_TEXT.confirmationLoadingText}
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">{CHECKOUT_CONST_TEXT.bookingNotFound}</h1>
          <Button onClick={() => navigate(APP_ROUTES.SERVICES)}>
            {CHECKOUT_CONST_TEXT.backToServicesText}
          </Button>
        </div>
      </div>
    );
  }

  const {
    serviceName,
    serviceDuration,
    amountPaid,
    selectedAddress,
    displayDateTime,
    currency,
    assignmentStatus,
  } = booking;

  const symbol = getCurrencySymbol(currency);

  const formattedAmount = `${symbol} ${amountPaid.toFixed(2)}`;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-line px-6 md:px-25 py-4 flex items-center justify-between sticky top-0 z-10">
      <Logo/>
      </header>

      <main className="max-w-225 mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white w-120 max-w-full min-h-146.75 mx-auto rounded-[20px] overflow-hidden">
          <div className="px-8 pt-10 pb-8 text-center border-b border-line-subtle">
            <h1 className="text-xl mb-2 text-center font-bold leading-8 tracking-[0%] text-ink-heading">
              {CHECKOUT_CONST_TEXT.thanksText}
            </h1>
            <p className="text-base text-center font-normal leading-5.5 tracking-[0.5%] text-ink-muted">
              Your <span className="font-semibold">{serviceName}</span> booking{" "}
              {CHECKOUT_CONST_TEXT.isConfirmed}
            </p>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold leading-5.5 tracking-[0.15%] text-ink-heading">
                {CHECKOUT_CONST_TEXT.bookingDetailsText}
              </h2>
              <Button
                variant="outline"
                onClick={handleInvoice}
                disabled={invoiceLoading}
                className="text-sm w-27.75 h-10 flex items-center justify-center gap-2 rounded-3xl border-2 border-primary-soft text-primary px-4 py-2.5 font-semibold hover:bg-primary-soft transition-colors disabled:opacity-50"
              >
                <Download size={14} />
                {invoiceLoading ? CHECKOUT_CONST_TEXT.loading : CHECKOUT_CONST_TEXT.invoice}
              </Button>
            </div>

            <div className="mb-2">
              <p className="text-sm font-semibold leading-5 tracking-[0.1%] text-ink-heading">
                {serviceName}
              </p>
              <p className="text-xs mt-0.5 font-medium leading-4 tracking-[0.4%] text-ink-muted">
                {serviceDuration}
              </p>
            </div>

            {assignmentStatus === "ASSIGNING_SERVICE_PARTNER" && (
              <AssigningSpinner />
            )}
            {assignmentStatus === "SERVICE_PARTNER_ASSIGNED" && (
              <div className="py-4 mb-4 border-y border-line-subtle mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-green-600 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    {CHECKOUT_CONST_TEXT.servicePartenerAssignedText}
                  </p>
                </div>
                <div className="bg-grey-50 rounded-2xl p-4 border border-line flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-sm w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold shadow-inner">
                      {booking.servicePartner?.image &&
                      booking.servicePartner.image !== "null" ? (
                        <img
                          src={booking.servicePartner.image}
                          alt={booking.servicePartner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="leading-none">
                          {getInitials(booking.servicePartner?.name) || "P"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-ink-heading">
                          {booking.servicePartner?.name}
                        </p>
                        {booking.servicePartner?.isVerified && (
                          <div className="relative group cursor-help">
                            <BadgeCheck className="w-4 h-4 text-green-600 fill-green-50 transition-transform group-hover:scale-110" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-ink-heading text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                              Verified
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink-heading" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted font-medium">
                        {booking.servicePartner?.serviceTypeName || CHECKOUT_CONST_TEXT.professionalPartner}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-line-subtle mt-2">
              <DetailRow label={CHECKOUT_CONST_TEXT.amountPaid} value={formattedAmount} />
              <DetailRow label={CHECKOUT_CONST_TEXT.location} value={selectedAddress} />
              <DetailRow label={CHECKOUT_CONST_TEXT.startDateTime} value={displayDateTime} />
            </div>
          </div>

          <div className="px-8 pb-8 flex items-center gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(APP_ROUTES.SERVICES)}
              className="text-sm w-full rounded-full border-2 border-line text-primary 
  font-bold leading-5 tracking-[1.25%]"
            >
              {CHECKOUT_CONST_TEXT.addServicesText}
            </Button>
            <Button
              variant="secondary"
              onClick={handleMyBookings}
              className="w-full px-8 py-3 rounded-full bg-primary hover:bg-primary-hover 
  text-white font-bold leading-5 tracking-[1.25%] 
  shadow-lg shadow-primary/20 transition-colors text-sm"
            >
              {CHECKOUT_CONST_TEXT.myBookings}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Success;
