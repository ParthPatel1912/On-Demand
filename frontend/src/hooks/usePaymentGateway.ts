import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { stripePromise } from "@/lib/stripe";
import { loadRazorpayScript } from "@/lib/razorpay";
import { logo } from "@/assets";
import { APP_ROUTES } from "@/routes/config";
import { UI_COLORS } from "@/constants/colors";
import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";

interface RazorpayOptions {
  amount: number;
  currency?: string;
  orderId?: string;
  providerOrderId?: string;
  bookingId: number;
  failureRedirectUrl?: string;
}

export const usePaymentGateway = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async (sessionId: string) => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      if (!stripe)
        throw new Error(CHECKOUT_CONST_TEXT.stripeInitializationFailed);

      const redirectResult = await stripe.redirectToCheckout({
        sessionId,
      });
      if (redirectResult) return;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : CHECKOUT_CONST_TEXT.somethingWentWrong;
      console.error(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (data: RazorpayOptions) => {
    try {
      setLoading(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error(CHECKOUT_CONST_TEXT.razorpayInitializationFailed);
        setLoading(false);
        return;
      }

      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        // currency: data.currency || DEFAULT_CURRENCY, // TODO: Remove when test keys are replaced with live keys
        name: CHECKOUT_CONST_TEXT.homeCare,
        description: CHECKOUT_CONST_TEXT.bookingPayment,
        image: logo,
        order_id: data.orderId || data.providerOrderId,
        handler: async (response: { razorpay_payment_id?: string }) => {
          if (response.razorpay_payment_id) {
            toast.success(CHECKOUT_CONST_TEXT.paymentSuccessful);
            navigate(
              APP_ROUTES.CHECKOUT_SUCCESS.replace(
                ":bookingId",
                String(data.bookingId),
              ),
            );
          } else {
            toast.error(CHECKOUT_CONST_TEXT.razorpayPaymentFailed);
            if (data.failureRedirectUrl) {
              navigate(data.failureRedirectUrl);
            }
            setLoading(false);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.mobile || "",
        },
        theme: { color: UI_COLORS.primary },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new (
        window as unknown as {
          Razorpay: new (options: unknown) => { open: () => void };
        }
      ).Razorpay(options);
      rzp.open();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : CHECKOUT_CONST_TEXT.razorpayPaymentFailed;
      toast.error(message);
      if (data.failureRedirectUrl) {
        navigate(data.failureRedirectUrl);
      }
      setLoading(false);
    }
  };

  return {
    handleStripePayment,
    handleRazorpayPayment,
    loading,
    setLoading,
  };
};
