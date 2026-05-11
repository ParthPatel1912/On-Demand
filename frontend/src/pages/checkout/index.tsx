import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import PaymentSummary from "../../components/checkout/PaymentSummary";
import PayWithPolicy from "../../components/checkout/PayWithPolicy";
import { APP_ROUTES } from "@/routes/config";
import type {
  IOtherSlotDetails,
  ILiftingSummaryType,
  IBookingPaymnet,
} from "@/types/service-checkout/serviceBooking.interface";
import Logo from "@/components/common/Logo";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { getBookingWithPayment } from "@/api/serviceBookingCheckout";
import { RETRIED_PAYMENT_STATUS, RETRIED_BOOKING_STATUS, CHECKOUT_CONST_TEXT, CHECKOUT_OTHER_DETAILS, CHECKOUT_LIFTING_SUMMARY } from "@/constants/checkout.text";
import RetryPaymentModal from "@/components/checkout/RetryPaymentModal";
import { PAYMENT_METHOD } from "@/utils/constants";
import toast from "react-hot-toast";

const Checkout = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [otherDetails, setOtherDetails] = useState<IOtherSlotDetails>(CHECKOUT_OTHER_DETAILS);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [liftingSummary, setLiftingSummary] = useState<ILiftingSummaryType>(CHECKOUT_LIFTING_SUMMARY);
  const params = useParams<{ serviceId: string }>();
  const [addressRefreshKey, setAddressRefreshKey] = useState(0);
  const [isOpenRetriedModel, setIsOpenRetriedModel] = useState<boolean>(false);
  const [bookingData, setBookingData] = useState<IBookingPaymnet | null>(null);

  useEffect(() => {
    if (!params.serviceId) {
      navigate(APP_ROUTES.SERVICES);
    }
  }, [params.serviceId, navigate]);

  useEffect(() => {
    if (bookingId) {
      const getBookingDetails = async () => {
        try {
          const res = await getBookingWithPayment(Number(bookingId));
          if (!res || !res.payment) return;

          const { status, payment } = res;
          const { paymentStatus, paymentMethod } = payment;

          const isRetriedCardPayment =
            RETRIED_BOOKING_STATUS.includes(status) &&
            RETRIED_PAYMENT_STATUS.includes(paymentStatus) &&
            paymentMethod === PAYMENT_METHOD.CARD;

          if (isRetriedCardPayment) {
            setBookingData(res);
            setIsOpenRetriedModel(true);
          } else {
            toast.success(`${CHECKOUT_CONST_TEXT.yourBookingWasAlready} ${status.toLowerCase()}`);
            navigate(`${APP_ROUTES.CHECKOUT_SUCCESS.replace(":bookingId", res.id)}`);
          }
        } catch (error) {
          setIsOpenRetriedModel(true);
          console.error(error);
        }
      };
      getBookingDetails();
    }
  }, [bookingId, navigate]);

  const payWithPolicyComponent = (
    <PayWithPolicy
      serviceId={Number(params.serviceId)}
      otherDetails={otherDetails}
      liftingSummary={liftingSummary}
      setLoading={setLoading}
      loading={loading}
    />
  );

  return (
    <div className="min-h-screen font-alexandria">
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      {/* Header */}
      <header className="border-b border-0 border-foreground/10 bg-background">
        <Container className="flex h-19.75 items-center justify-between">
          <Logo />
          <Button
            variant="outline"
            className="text-primary! text-sm font-bold border-2 border-line px-5 py-2 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            {CHECKOUT_CONST_TEXT.back}
          </Button>
        </Container>
      </header>

      {/* Main Content */}
      <main className="px-4 lg:px-6 py-10 max-w-300 w-full mx-auto">
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 w-full overflow-hidden">
         <div className="lg:col-span-7 w-full min-w-0">
            <CheckoutSteps
              duration={liftingSummary.duration}
              setOtherDetails={setOtherDetails}
              addressRefreshKey={addressRefreshKey}
              onAddressRefresh={() => setAddressRefreshKey((prev) => prev + 1)}
            />
            <div className="hidden lg:flex flex-col sm:ml-[65px]">
              {payWithPolicyComponent}
            </div>
          </div>
          <div className="px-2 mx-auto lg:mx-0 w-full lg:w-auto lg:col-span-5 self-start lg:sticky">
            <PaymentSummary
              setLiftingSummary={setLiftingSummary}
              liftingSummary={liftingSummary}
            />
          </div>
          <div className="flex lg:hidden flex-col items-center mt-3">
            {payWithPolicyComponent}
          </div>
        </div>
      </main>

      {bookingId && isOpenRetriedModel && bookingData && (
        <RetryPaymentModal
          isOpen={isOpenRetriedModel}
          onClose={() => setIsOpenRetriedModel(false)}
          bookingData={bookingData}
        />
      )}
    </div>
  );
};

export default Checkout;
