import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { payForServiceBooking } from "@/api/serviceBookingCheckout";
import { APP_ROUTES } from "@/routes/config";
import type {
  ICheckoutPayload,
  IPayWithPolicyProps,
} from "@/types/service-checkout/serviceBooking.interface";
import { usePaymentGateway } from "@/hooks/usePaymentGateway";
import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";
import { PAYMENT_GATEWAY } from "@/utils/constants";

const PayWithPolicy = ({
  serviceId,
  liftingSummary,
  otherDetails,
  setLoading,
  loading,
}: IPayWithPolicyProps) => {
  const navigate = useNavigate();
  const { paymentMethod, paymentGateway, slot, addressId } = otherDetails;
  const { finalAmount, tax, appliedCoupon } = liftingSummary;
  const couponId = appliedCoupon?.id || 0;

  const {
    handleStripePayment,
    handleRazorpayPayment,
  } = usePaymentGateway();

  const handlePay = async () => {
    if (!paymentMethod) {
      toast.error(CHECKOUT_CONST_TEXT.pleaseSelectAPaymentMethod);
      return;
    }

    if (paymentMethod === "CARD" && !paymentGateway) {
      toast.error(CHECKOUT_CONST_TEXT.pleaseSelectAPaymentGateway);
      return;
    }

    const payload: ICheckoutPayload = {
      userId: Number(JSON.parse(localStorage.getItem("userInfo") || "{}").id),
      serviceId: serviceId,
      addressId: addressId,
      slot: slot || { date: "", time: "" },
      paymentMethod: paymentMethod || "",
      paymentGateway: paymentGateway || "",
      couponId: couponId,
      tax: tax || 0,
    };
    try {
      setLoading(true);

      const data = await payForServiceBooking(payload);

      if (data.paymentMethod === "CARD") {
        if (paymentGateway !== data.paymentGateway) {
          toast.error(
            `${CHECKOUT_CONST_TEXT.pleasePayUsing} ${data.paymentGateway.toLowerCase()}, ${CHECKOUT_CONST_TEXT.yourProcessIsAlreadyRunningWith} ${data.paymentGateway}`,
          );
          return;
        }
        if (paymentGateway === PAYMENT_GATEWAY.STRIPE && data.sessionId) {
          await handleStripePayment(data.sessionId);
        } else if (paymentGateway === PAYMENT_GATEWAY.RAZORPAY) {
          await handleRazorpayPayment({
            amount: finalAmount,
            currency: CHECKOUT_CONST_TEXT.usdCurrency,
            orderId: data.orderId,
            bookingId: data.bookingId,
            failureRedirectUrl: `/checkout/${serviceId}?bookingId=${data.bookingId}`,
          });
        }
      }
      if (data.paymentMethod === "CASH" && data.bookingId) {
        navigate(
          `${APP_ROUTES.CHECKOUT_SUCCESS.replace(":bookingId", data.bookingId)}`,
        );
        return;
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : CHECKOUT_CONST_TEXT.somethingWentWrong;
      console.error(message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center w-full px-4 sm:px-6">
        {paymentMethod && (
          <Button
            onClick={handlePay}
            disabled={loading || !paymentMethod}
            className="rounded-full max-w-full mb-6 sm:max-w-fit w-full sm:w-auto px-10 sm:px-25 py-3 sm:py-3 bg-primary hover:bg-primary-hover text-white font-bold"
          >
            {loading
              ? CHECKOUT_CONST_TEXT.paying
              : `Pay $${finalAmount.toFixed(2)}`}
          </Button>
        )}
      </div>
      <Card className="w-full flex flex-col gap-2 mt-2 bg-grey-50 items-start border-0 rounded-xl p-5 sm:p-6 shadow-none">
        <h4 className="text-ink font-alexandria font-semibold text-md text-start tracking-[0.01em]">
          {CHECKOUT_CONST_TEXT.cancellationPolicy}
        </h4>

        <p className="text-ink text-sm font-alexandria font-medium leading-5.5 mb-1 text-start tracking-[0.01em]">
          {CHECKOUT_CONST_TEXT.cancellationPolicyDescription}
        </p>
        <Button
          variant="link"
          onClick={() => navigate(APP_ROUTES.PRIVACY_POLICY)}
          className="p-0 h-auto text-primary text-sm font-bold no-underline hover:underline"
        >
          {CHECKOUT_CONST_TEXT.learnMore}
        </Button>
      </Card>
    </>
  );
};

export default PayWithPolicy;
