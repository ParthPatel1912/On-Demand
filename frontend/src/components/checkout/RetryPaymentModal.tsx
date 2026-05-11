import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, RefreshCw, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { APP_ROUTES } from "@/routes/config";
import type {
  IBookingPaymnet,
  IPaymentGatewayValue,
  IPaymentMethodValue,
  IServiceManagement,
  RetryPaymentModalProps,
  TPaymentGateway,
  TPaymentMethod,
} from "@/types/service-checkout/serviceBooking.interface";
import axiosInstance from "@/helper/axiosInstance";
import { format } from "date-fns";
import CommonPopup from "../common/CommonPopup";
import {
  CurrencySymbol,
  PAYMENT_GATEWAY,
  PAYMENT_GATEWAY_OPTIONS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_OPTIONS,
} from "@/utils/constants";
import { retryBookingWithPayment } from "@/api/serviceBookingCheckout";
import { usePaymentGateway } from "@/hooks/usePaymentGateway";
import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";

const RetryPaymentModal: React.FC<RetryPaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
}) => {
  const navigate = useNavigate();
  const { handleStripePayment, handleRazorpayPayment } = usePaymentGateway();

  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<IServiceManagement | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<IPaymentMethodValue | null>(
      PAYMENT_METHOD_OPTIONS.find(
        (m) => m.value === bookingData.payment.paymentMethod,
      ) || null,
    );

  const [selectedGateway, setSelectedGateway] =
    useState<IPaymentGatewayValue | null>(
      PAYMENT_GATEWAY_OPTIONS.find(
        (g) => g.value === bookingData.payment.paymentGateway,
      ) || null,
    );

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `services/${bookingData.serviceId}`,
        );
        if (response.data.success && response.data.data) {
          setService(response.data.data);
        }
      } catch (error) {
        console.error(CHECKOUT_CONST_TEXT.errorFetchingServiceDetails, error);
      }
    };

    if (isOpen && bookingData.serviceId) {
      fetchServiceDetails();
    }
  }, [isOpen, bookingData.serviceId]);

  const isExpired = useMemo(() => {
    if (!bookingData.expiresAt) return false;
    return new Date(bookingData.expiresAt) < new Date();
  }, [bookingData.expiresAt]);

  const handleStripeRetry = async (sessionId: string) => {
    await handleStripePayment(sessionId);
  };

  const handleRazorpayRetry = async (data: IBookingPaymnet) => {
    await handleRazorpayPayment({
      amount: data.amount,
      currency: data.payment.currency,
      orderId: data.payment.orderId || undefined,
      bookingId: data.id,
      failureRedirectUrl: `/checkout/${data.id}?paymentStatus=FAILED`,
    });
  };

  const handleRetryPay = async ({
    paymentMethod,
    paymentGateway,
  }: {
    paymentMethod: TPaymentMethod;
    paymentGateway?: TPaymentGateway;
  }) => {
    const result = await retryBookingWithPayment({
      bookingId: bookingData.id,
      paymentMethod,
      paymentGateway,
    });

    if (!result) return;

    const { bookingId, sessionId, orderId, paymentGateway: gateway } = result;

    // CASH FLOW
    if (result.paymentMethod === PAYMENT_METHOD.CASH) {
      navigate(
        `${APP_ROUTES.CHECKOUT_SUCCESS.replace(":bookingId", bookingId)}`,
      );
      setLoading(false);
      return;
    }

    // STRIPE FLOW
    if (gateway === PAYMENT_GATEWAY.STRIPE && sessionId) {
      return handleStripeRetry(sessionId);
    }

    // RAZORPAY FLOW
    if (gateway === PAYMENT_GATEWAY.RAZORPAY && orderId) {
      return handleRazorpayRetry({
        ...bookingData,
        payment: {
          ...bookingData.payment,
          orderId,
        },
      });
    }
  };

  const handleRetry = async () => {
    try {
      setLoading(true);
      const { payment } = bookingData;
      const { sessionId, orderId, paymentGateway } = payment;

      const methodValue = selectedMethod?.value;
      const gatewayValue = selectedGateway?.value;

      if (!methodValue) {
        toast.error(CHECKOUT_CONST_TEXT.pleaseSelectAPaymentMethod);
        return;
      }
      if (methodValue === PAYMENT_METHOD.CARD && !gatewayValue) {
        toast.error(CHECKOUT_CONST_TEXT.pleaseSelectAPaymentGateway);
        return;
      }

      const isCard = methodValue === PAYMENT_METHOD.CARD;
      const isCash = methodValue === PAYMENT_METHOD.CASH;
      const isSameGateway = gatewayValue === paymentGateway;

      // CARD FLOW
      if (isCard) {
        // Retry with same gateway
        if (isSameGateway) {
          if (sessionId) {
            await handleStripeRetry(sessionId);
            return;
          }

          if (orderId) {
            await handleRazorpayRetry(bookingData);
            return;
          }

          return;
        }

        // Retry with different gateway
        if (gatewayValue) {
          await handleRetryPay({
            paymentMethod: methodValue,
            paymentGateway: gatewayValue,
          });
        }

        return;
      }

      // CASH FLOW
      if (isCash) {
        await handleRetryPay({ paymentMethod: methodValue });
        return;
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error(CHECKOUT_CONST_TEXT.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewService = () => {
    navigate(
      `${APP_ROUTES.CHECKOUT.replace(":serviceId", String(bookingData.serviceId))}`,
    );
    onClose();
  };

  const handleCancelConfirm = () => {
    navigate(
      APP_ROUTES.CHECKOUT.replace(":serviceId", String(bookingData.serviceId)),
    );
    onClose();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-[90vw] max-w-105 p-0 overflow-hidden border-none bg-white"
      >
        <div className="p-4 sm:p-6 md:p-8">
          <DialogHeader className="gap-1! items-start! pt-0">
            <DialogTitle className="flex flex-row items-center justify-between gap-3 text-xl sm:text-2xl! font-alexandria font-bold text-sm sm:text-base md:text-base leading-5 sm:leading-5.5 tracking-[0.0015em]">
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${isExpired ? "bg-red-50" : "bg-blue-50"}`}
              >
                <XCircle className="w-4 h-4 md:w-6 md:h-6 text-red-500" />
              </div>
              {isExpired ? CHECKOUT_CONST_TEXT.paymentExpired : CHECKOUT_CONST_TEXT.paymentFailed}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base md:text-md font-medium font-alexandria text-ink-muted leading-relaxed text-left">
              {isExpired
                ? CHECKOUT_CONST_TEXT.paymentExpiredDescription
                : `${bookingData.cancellationReason ? `Payment failed: ${bookingData.cancellationReason}` : ""} Retry with same payment method or choose cash.`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Service Details */}
            <div
              className={`bg-surface-elevated rounded-xl p-4 space-y-3 border ${isExpired ? "border-destructive" : "border-line"}`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-ink text-sm sm:text-base font-alexandria line-clamp-1">
                  {service?.name || CHECKOUT_CONST_TEXT.serviceName}
                </h3>
                <p className="font-bold text-primary text-sm sm:text-base font-alexandria whitespace-nowrap">
                  {CurrencySymbol[bookingData.payment.currency.toUpperCase()]}
                  {bookingData.amount}
                </p>
              </div>
              <div className="flex flex-row gap-2 flex-wrap items-start">
                <div className="flex items-center gap-2 text-ink-muted">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium font-alexandria">
                    {bookingData.payment.slot.date
                      ? format(
                          new Date(bookingData.payment.slot.date),
                          "dd MMM yyyy",
                        )
                      : CHECKOUT_CONST_TEXT.dateNotAvailable}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-ink-muted">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium font-alexandria">
                    {bookingData.payment.slot.time || CHECKOUT_CONST_TEXT.timeNotAvailable}
                  </span>
                </div>
              </div>
            </div>

            {!isExpired && (
              <div className="space-y-3">
                <p className="text-sm font-semibold font-alexandria text-ink">
                  Update Payment Method
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHOD_OPTIONS.map((m) => {
                    const active = m.value === selectedMethod?.value;
                    return (
                      <Button
                        key={m.value}
                        variant="outline"
                        className={[
                          "rounded-full h-9 px-4 py-2 transition-colors bg-surface-neutral font-alexandria font-medium text-sm",
                          "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                          active
                            ? "border-primary text-primary bg-surface-faintAlt"
                            : "border-line text-ink hover:bg-surface-faint",
                        ].join(" ")}
                        onClick={() => {
                          setSelectedMethod(m);
                          if (m.value === "CASH") {
                            setSelectedGateway(null);
                          }
                        }}
                      >
                        {m.title}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            {!isExpired && selectedMethod?.value === "CARD" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold font-alexandria text-ink">
                  Pay with
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_GATEWAY_OPTIONS.map((m) => {
                    const active = m.value === selectedGateway?.value;
                    return (
                      <Button
                        key={m.value}
                        variant="outline"
                        className={[
                          "rounded-full h-9 px-4 py-2 transition-colors bg-surface-neutral font-alexandria font-medium text-sm",
                          active
                            ? "border-primary text-primary bg-surface-faintAlt"
                            : "border-line text-ink hover:bg-surface-faint",
                        ].join(" ")}
                        onClick={() => setSelectedGateway(m)}
                      >
                        {m.title}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isExpired ? (
            <div className="w-full flex items-center justify-center mt-6 sm:mt-8">
              <Button
                onClick={handleCreateNewService}
                className="w-fit h-10 sm:h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-base sm:text-lg transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-4 sm:px-6"
              >
                {CHECKOUT_CONST_TEXT.bookNewService}
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-row items-stretch justify-end space-x-3 mt-6 sm:mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
                className="w-fit h-8 sm:h-10 rounded-full border-2 border-line text-ink-muted font-bold text-base sm:text-sm hover:bg-gray-50 transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-4 sm:px-6"
              >
                {CHECKOUT_CONST_TEXT.cancel}
              </Button>
              <Button
                onClick={handleRetry}
                disabled={loading}
                className="w-fit h-8 sm:h-10 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-base sm:text-sm flex items-center justify-center gap-2 transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none px-4 sm:px-6"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                {CHECKOUT_CONST_TEXT.retryPayment}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <CommonPopup
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title={CHECKOUT_CONST_TEXT.cancelPayment}
        onSave={handleCancelConfirm}
        saveText={CHECKOUT_CONST_TEXT.yes}
        cancelText={CHECKOUT_CONST_TEXT.no}
        onCancel={() => setShowCancelConfirm(false)}
        variant="small"
        buttonRounded="full"
      >
        <p className="text-ink-muted font-alexandria text-sm sm:text-base -mt-4 font-medium">
          {CHECKOUT_CONST_TEXT.cancelPaymentDesc}
        </p>
      </CommonPopup>
    </Dialog>
  );
};

export default RetryPaymentModal;
