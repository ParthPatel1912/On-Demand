import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BadgePercent, X } from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommonPopup from "@/components/common/CommonPopup";
import CouponsModal from "@/components/checkout/CouponsModal";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/helper/axiosInstance";
import { APP_ROUTES } from "@/routes/config";
import type {
  ILiftingSummaryType,
  IServiceManagement,
} from "@/types/service-checkout/serviceBooking.interface";
import { HorizontalCarousel } from "../home/HorizontalCarousel";
import type { GetOffersQueryDto, ICoupon } from "@/types/offers.interface";
import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";
import { getOffers } from "@/api/offer.services";

interface IProps {
  liftingSummary: ILiftingSummaryType;
  setLiftingSummary: Dispatch<SetStateAction<ILiftingSummaryType>>;
}

const PaymentSummary = ({ liftingSummary, setLiftingSummary }: IProps) => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<IServiceManagement | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCouponsPopup, setShowCouponsPopup] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(5); // Default to 5%
  const [couponValidating, setCouponValidating] = useState(false);
  const { finalAmount, appliedCoupon } = liftingSummary;
  const navigate = useNavigate();

  const fetchServiceDetails = async () => {
    if (!serviceId) return;

    try {
      setServiceLoading(true);
      const response = await axiosInstance.get(`services/${serviceId}`);
      if (response.data.success && response.data.data) {
        setService(response.data.data);
        const updatedDuration: number = response.data.data.duration || 0;
        setLiftingSummary((prev: ILiftingSummaryType) => ({
          ...prev,
          duration: updatedDuration,
        }));
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
      navigate(APP_ROUTES.SERVICES);
    } finally {
      setServiceLoading(false);
    }
  };

  const fetchTaxConfiguration = async () => {
    try {
      const response = await axiosInstance.get(`configurations/key/taxes`);
      if (response.data.success && response.data.data) {
        const taxValue = response.data.data.value || response.data.data;
        const updatedValue =
          typeof taxValue === "number" ? taxValue : parseFloat(taxValue) || 5;
        setTaxPercentage(updatedValue);
        setLiftingSummary((prev: ILiftingSummaryType) => ({
          ...prev,
          tax: Number(updatedValue),
        }));
      }
    } catch (error) {
      console.error(CHECKOUT_CONST_TEXT.errorFetchingTaxConfiguration, error);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        per_page: "5",
        status: "active",
        is_applicable: "true",
      });

      const response = await getOffers(params as GetOffersQueryDto);
      if (response.data.success && response.data.data) {
        setCoupons(response.data.data);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error(CHECKOUT_CONST_TEXT.errorFetchingCoupons, error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
    fetchCoupons();
    fetchTaxConfiguration();
  }, [serviceId]);

  const handleApplyCoupon = async (coupon: ICoupon) => {
    if (!service || couponValidating) return;

    try {
      setCouponValidating(true);

      const userId = getUserId();

      let url = `coupon-usages/check/${coupon.id}`;

      if (userId) {
        url += `?userId=${userId}`;
      }

      const response = await axiosInstance.get(url);

      if (response.data.success) {
        setLiftingSummary((prev: ILiftingSummaryType) => ({
          ...prev,
          appliedCoupon: coupon,
        }));
        toast.success(response.data.data.message);
      }
    } catch (error) {
      console.error(CHECKOUT_CONST_TEXT.errorValidatingCoupon, error);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleSelectCouponFromPopup = (coupon: ICoupon) => {
    handleApplyCoupon(coupon);
    setShowCouponsPopup(false);
  };

  const handleRemoveCoupon = () => {
    setLiftingSummary((prev: ILiftingSummaryType) => ({
      ...prev,
      appliedCoupon: null,
    }));
  };

  const getUserId = () => {
    try {
      const userInfoString = localStorage.getItem("userInfo");
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        return userInfo.id || userInfo.user_id || 0;
      }
    } catch (error) {
      console.error("Error parsing userInfo:", error);
    }
    return 0;
  };

  const calculateFinalAmount = () => {
    if (!service) {
      setLiftingSummary((prev: ILiftingSummaryType) => ({
        ...prev,
        finalAmount: 0,
      }));
      return;
    }

    const basePrice = parseFloat(service.price);
    const discountAmount = appliedCoupon
      ? basePrice * (appliedCoupon.discount_percentage / 100)
      : 0;
    const discountedPrice = basePrice - discountAmount;
    const subtotal = discountedPrice;
    const taxAmount = basePrice * (taxPercentage / 100);
    const amount = Math.max(0, subtotal + taxAmount);
    setLiftingSummary((prev: ILiftingSummaryType) => ({
      ...prev,
      finalAmount: amount,
    }));
  };

  useEffect(() => {
    calculateFinalAmount();
  }, [service, taxPercentage, appliedCoupon]);

  // Coupon Card Component
  const CouponCard = ({ coupon }: { coupon: ICoupon }) => (
    <Card className="bg-white border border-line rounded-[8px] p-4 shadow-none shrink-0 w-full justify-center">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center">
            <BadgePercent size={26} className="text-primary" />
          </div>
          <div>
            <p className="text-ink font-semibold text-sm break-all">
              {coupon.coupon_code}
            </p>
            <div className="text-ink text-sm">
              {coupon.coupon_description}
            </div>
          </div>
        </div>
        <Button
          variant="link"
          size="xs"
          onClick={() => handleApplyCoupon(coupon)}
          disabled={couponValidating || appliedCoupon?.id === coupon.id}
          className={`font-bold text-sm no-underline! ${
            appliedCoupon?.id === coupon.id
              ? "text-green-600 hover:text-green-700"
              : "text-primary hover:text-primary/80"
          }`}
        >
          {couponValidating && appliedCoupon?.id === coupon.id
            ? CHECKOUT_CONST_TEXT.loading
            : appliedCoupon?.id === coupon.id
              ? CHECKOUT_CONST_TEXT.applied
              : CHECKOUT_CONST_TEXT.add}
        </Button>
      </div>
    </Card>
  );

  // Coupon Card Skeleton Component
  const CouponCardSkeleton = () => (
    <Card className="bg-white border border-line rounded-[8px] p-4 shadow-none shrink-0 flex-1 w-full items-center justify-center">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </Card>
  );
  return (
    <div className="flex flex-col gap-6">
      {/* Payment Summary Box */}
      <div>
        <h3 className="text-ink font-bold text-base mb-4">
          {CHECKOUT_CONST_TEXT.paymentSummary}
        </h3>
        <Card className="bg-white border border-line rounded-xl p-6 shadow-none flex flex-col gap-4">
          {serviceLoading ? (
            <div className="flex justify-between items-center gap-2 text-sm">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
          ) : service ? (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink-muted">{service.name}</span>
              <span className="text-ink font-medium">${service.price}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink-muted">Service not found</span>
              <span className="text-ink font-medium">$0.00</span>
            </div>
          )}
          {appliedCoupon ? (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink-muted">
                Coupon code{" "}
                <span className="text-primary font-bold">
                  {appliedCoupon.coupon_code}
                </span>{" "}
                Added
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemoveCoupon}
                  className="cursor-pointer text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={16} />
                </button>
                <span className="text-booking-completed font-medium">
                  -$
                  {service
                    ? (
                        parseFloat(service.price) *
                        (appliedCoupon.discount_percentage / 100)
                      ).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink-muted">No coupon applied</span>
              <span className="text-ink-muted font-medium">$0.00</span>
            </div>
          )}

          <div className="h-px w-full border-t border-dashed border-line my-1"></div>

          {service ? (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink font-bold">Total</span>
              <span className="text-ink font-bold">
                $
                {(() => {
                  const basePrice = parseFloat(service.price);
                  const discountAmount = appliedCoupon
                    ? basePrice * (appliedCoupon.discount_percentage / 100)
                    : 0;
                  const subtotal = basePrice - discountAmount;
                  return subtotal.toFixed(2);
                })()}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink font-bold">Subtotal</span>
              <span className="text-ink font-bold">$0.00</span>
            </div>
          )}
          {service ? (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink-muted">Taxes ({taxPercentage}%)</span>
              <span className="text-ink font-medium">
                $
                {(() => {
                  const basePrice = parseFloat(service.price);
                  const taxAmount = basePrice * (taxPercentage / 100);
                  return taxAmount.toFixed(2);
                })()}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2 text-sm">
              <span className="text-ink-muted">Taxes ({taxPercentage}%)</span>
              <span className="text-ink font-medium">$0.00</span>
            </div>
          )}

          <div className="h-px w-full border-t border-dashed border-line my-1"></div>

          {service ? (
            <div className="flex justify-between items-center gap-2 text-base">
              <span className="text-ink font-bold">
                {CHECKOUT_CONST_TEXT.totalAmountToPay}
              </span>
              <span className="text-ink font-bold">
                ${finalAmount.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2 text-base">
              <span className="text-ink font-bold">
                {CHECKOUT_CONST_TEXT.totalAmountToPay}
              </span>
              <span className="text-ink font-bold">$0.00</span>
            </div>
          )}
        </Card>
      </div>

      {/* Coupons & Offers Box */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-ink font-bold text-sm">
            {CHECKOUT_CONST_TEXT.couponsAndOffers}
          </h3>
          <Button
            variant="outline"
            className="text-primary! text-sm font-bold px-4 py-1.5 rounded-full"
            onClick={() => setShowCouponsPopup(true)}
          >
            {CHECKOUT_CONST_TEXT.viewAll} <ArrowRight size={14} />
          </Button>
        </div>

        <HorizontalCarousel
          className="mt-4"
          buttonPosition="top-1/2 -translate-y-1/2"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <CouponCardSkeleton key={index} />
              ))
            : coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
        </HorizontalCarousel>
      </div>

      {/* Coupons List Popup */}
      <CommonPopup
        open={showCouponsPopup}
        onOpenChange={setShowCouponsPopup}
        title="All Available Coupons"
        hideFooter={true}
        variant="fullWidth"
        className="max-w-[90vw]! sm:max-w-200! w-full"
        bodyClassName="max-h-[80vh] overflow-y-auto"
      >
        <CouponsModal
          onCouponSelect={handleSelectCouponFromPopup}
          appliedCoupon={appliedCoupon}
          couponValidating={couponValidating}
        />
      </CommonPopup>
    </div>
  );
};

export default PaymentSummary;
