import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AuthModals from "./AuthModals";
import AddressModal from "./AddressModal";
import { getAddresses } from "@/api/customerAddress";
import PaymentMethod from "./PaymentMethod";
import SlotModal from "./SlotModal";
import { convertStringDateToGBFormat } from "@/utils";
import ConfirmPopup from "@/components/common/ConfirmPopup";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import axiosInstance from "@/helper/axiosInstance";
import { urlStrings } from "@/pages/auth/config/constant";
import toast from "react-hot-toast";
import type {
  AddressType,
  CheckoutStepProps,
  IOtherSlotDetails,
  IPaymentGatewayValue,
  IPaymentMethodValue,
  SlotType,
  UserType,
} from "@/types/service-checkout/serviceBooking.interface";

// Images
import checkImg from "@/assets/checkout/check.png";
import locationBlueImg from "@/assets/checkout/location-blue.png";
import locationImg from "@/assets/checkout/location.png";
import paymentImg from "@/assets/checkout/payment.png";
import slotsImg from "@/assets/checkout/slots.png";
import userImg from "@/assets/checkout/user.png";
import paymentBlueImg from "@/assets/checkout/payment-blue.png";
import slotsBlueImg from "@/assets/checkout/slot-blue.png";
import {
  CUSTOMER_AUTH_TOKEN_KEY,
  CUSTOMER_AUTH_USER_KEY,
  ADMIN_AUTH_TOKEN_KEY,
  PARTNER_AUTH_TOKEN_KEY,
} from "@/utils/constants";
import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";

const getInitialUser = (): UserType => {
  const token = localStorage.getItem(CUSTOMER_AUTH_TOKEN_KEY);
  const userInfoString = localStorage.getItem(CUSTOMER_AUTH_USER_KEY);
  if (token && userInfoString) {
    try {
      const parsedUser = JSON.parse(userInfoString);
      return parsedUser;
    } catch {
      return null;
    }
  }
  return null;
};

const CheckoutSteps = ({
  duration,
  setOtherDetails,
  addressRefreshKey,
  onAddressRefresh,
}: CheckoutStepProps) => {
  const [user, setUser] = useState<UserType>(() => getInitialUser());
  const [currentStep, setCurrentStep] = useState<number>(() =>
    getInitialUser() ? 2 : 1,
  );
  const [address, setAddress] = useState<AddressType>(null);
  const [slot, setSlot] = useState<SlotType>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [paymentMethodValue, setPaymentMethodValue] =
    useState<IPaymentMethodValue | null>(null);
  const [paymentGatewayValue, setPaymentGatewayValue] =
    useState<IPaymentGatewayValue | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem(CUSTOMER_AUTH_TOKEN_KEY);
    const userInfoString = localStorage.getItem(CUSTOMER_AUTH_USER_KEY);

    if (token && userInfoString) {
      try {
        const parsedUser = JSON.parse(userInfoString);
        setUser(parsedUser);
        setCurrentStep(2);
        fetchAddresses();
      } catch (e) {
        console.error("Failed to parse userInfo", e);
      }
    }
  }, [addressRefreshKey]);

  const isStepCompleted = (id: number) => {
    if (id === 1) return !!user;
    if (id === 2) return !!address;
    if (id === 3) return !!slot?.date;
    if (id === 4) return !!paymentMethodValue;
    return false;
  };

  const isStepLocked = (id: number) => {
    if (id === 1) return false;
    // Step is locked if the previous step is not completed AND we don't have data for this step yet
    return !isStepCompleted(id - 1) && !isStepCompleted(id);
  };

  const steps = [
    { id: 1, title: "Booking For" },
    { id: 2, title: "Address" },
    { id: 3, title: "Slot" },
    { id: 4, title: "Payment Method" },
  ];

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();

      if (response.success && response.data.length > 0) {
        // default first address select
        setAddress(response.data[0]);

        // if address exists, move to slot step
        setCurrentStep((prev) => (prev < 3 ? 3 : prev));
      } else {
        // no address found
        setAddress(null);
        setCurrentStep((prev) => (prev < 2 ? 2 : prev));
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    }
  };

  const getStepImage = (
    stepId: number,
    isActive: boolean,
    isCompleted: boolean,
  ) => {
    if (isCompleted) return checkImg;
    if (stepId === 1) return userImg;
    if (stepId === 2) return isActive ? locationBlueImg : locationImg;
    if (stepId === 3) return isActive ? slotsBlueImg : slotsImg;
    if (stepId === 4) return isActive ? paymentBlueImg : paymentImg;

    return locationImg;
  };

  const handleSignInClick = () => {
    const adminToken = localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
    const partnerToken = localStorage.getItem(PARTNER_AUTH_TOKEN_KEY);

    if (adminToken) {
      setLoggedInRole("Admin");
      setShowConfirmLogout(true);
    } else if (partnerToken) {
      setLoggedInRole("Service Partner");
      setShowConfirmLogout(true);
    } else {
      setIsSignModalOpen(true);
    }
  };

  const handleLogoutConfirm = async () => {
    const adminToken = localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
    const partnerToken = localStorage.getItem(PARTNER_AUTH_TOKEN_KEY);

    try {
      if (adminToken) {
        await axiosInstanceLaravel.post(urlStrings.adminLogout);
      } else if (partnerToken) {
        await axiosInstance.post(urlStrings.servicePartnerLogout);
      }
      toast.success(CHECKOUT_CONST_TEXT.logedOutSuccess);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, we want to clear local storage and proceed
    } finally {
      localStorage.clear();
      setShowConfirmLogout(false);
      setIsSignModalOpen(true);
      // Reset user state to ensure clean start
      setUser(null);
    }
  };

  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = isStepCompleted(step.id);
        const isLocked = isStepLocked(step.id);

        return (
          <div
            key={step.id}
            className="flex flex-row gap-4 sm:gap-6 items-stretch pb-6"
          >
            {/* Icon & Line Column */}
            <div className="relative flex w-10 shrink-0 flex-col items-center justify-center">
              {/* Top connecting line segment */}
              {index > 0 && (
                <div
                  className={`absolute bottom-1/2 -top-6 w-0 border-l-2 border-dashed ${
                    isStepCompleted(steps[index - 1].id) &&
                    !isStepLocked(steps[index - 1].id)
                      ? "border-primary"
                      : "border-gray-200"
                  }`}
                />
              )}

              {/* Bottom connecting line segment */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute -bottom-10 top-1/2 w-0 border-l-2 border-dashed ${
                    isCompleted && !isLocked
                      ? "border-primary"
                      : "border-gray-200"
                  }`}
                />
              )}

              {/* Step Icon */}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white">
                <img
                  src={getStepImage(step.id, isActive, isCompleted)}
                  alt={step.title}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {/* Step Content Card */}
            <Card
              className={`flex-1 w-full bg-white border ${
                isActive ? "border-primary shadow-md" : "border-line"
              } rounded-xl p-5 sm:p-4 shadow-none! min-h-20`}
            >
              <div className="flex flex-col h-full justify-center">
                {step.id === 1 && (
                  <div className="flex flex-col items-start gap-2">
                    <h3 className="text-ink font-bold text-base">
                      {CHECKOUT_CONST_TEXT.bookingFor}
                    </h3>
                    {user ? (
                      <div className="text-sm font-normal leading-5 tracking-[0.25%] text-ink flex-1">
                        {user.email}
                      </div>
                    ) : (
                      <Button
                        className="rounded-[40px] font-bold leading-5 tracking-[1.25%] text-sm"
                        onClick={handleSignInClick}
                      >
                        {CHECKOUT_CONST_TEXT.signIn}
                      </Button>
                    )}
                  </div>
                )}

                {step.id === 2 && (
                  <div className="flex flex-col items-start gap-2 w-full">
                    <h3
                      className={`font-bold text-base ${
                        isLocked ? "text-ink-subtle" : "text-ink"
                      }`}
                    >
                      {CHECKOUT_CONST_TEXT.addressText}
                    </h3>
                    {!isLocked &&
                      (address ? (
                        <div className="flex justify-between items-center w-full gap-4">
                          <div className="font-normal text-sm leading-5 tracking-[0.25%] text-ink flex-1">
                            <span className="font-semibold text-ink">
                              {address.label}:
                            </span>{" "}
                            {address.full_address}
                          </div>
                          {isCompleted && (
                            <Button
                              variant="outline"
                              className="mt-[-24px] text-sm rounded-full border-line text-primary font-bold leading-5 tracking-[1.25%] px-4 py-2.5 h-10 border-2"
                              onClick={() => {
                                setIsAddressModalOpen(true);
                              }}
                            >
                              {CHECKOUT_CONST_TEXT.edit}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="rounded-[40px] text-sm font-bold leading-5 tracking-[1.25%]"
                          onClick={() => {
                            setIsAddressModalOpen(true);
                          }}
                        >
                          {CHECKOUT_CONST_TEXT.selectAddress}
                        </Button>
                      ))}
                  </div>
                )}

                {step.id === 3 && (
                  <div className="flex flex-col items-start gap-2 w-full">
                    <h3
                      className={`font-bold text-base ${
                        isLocked ? "text-ink-subtle" : "text-ink"
                      }`}
                    >
                      {CHECKOUT_CONST_TEXT.slot}
                    </h3>
                    {!isLocked &&
                      (slot?.date && slot?.time ? (
                        <div className="flex justify-between items-start w-full gap-4 text-ink">
                          <div className="text-sm font-normal leading-5 tracking-[0.25%] text-ink flex-1">
                            {convertStringDateToGBFormat(slot.date)} at{" "}
                            {slot.time}
                          </div>
                          {isCompleted && (
                            <Button
                              variant="outline"
                              className="mt-[-24px] text-sm px-4 py-2.5 h-10 border-2 rounded-full border-line text-primary font-bold leading-5 tracking-[1.25%]"
                              onClick={() => {
                                setIsSlotModalOpen(true);
                              }}
                            >
                              {CHECKOUT_CONST_TEXT.edit}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="rounded-[40px] text-sm font-bold leading-5 tracking-[1.25%]"
                          onClick={() => {
                            setIsSlotModalOpen(true);
                          }}
                        >
                          {CHECKOUT_CONST_TEXT.bookSlot}
                        </Button>
                      ))}
                  </div>
                )}

                {step.id === 4 && (
                  <div className="flex flex-col items-start gap-2 w-full">
                    <h3
                      className={`font-bold text-base ${
                        isLocked ? "text-ink-subtle" : "text-ink"
                      }`}
                    >
                      {CHECKOUT_CONST_TEXT.paymentMethod}
                    </h3>
                    {!isLocked &&
                      (paymentMethodValue ? (
                        <div className="flex justify-between items-start w-full gap-4 text-ink">
                          <div className="font-normal text-sm leading-5 tracking-[0.25%] text-ink flex-1">
                            {paymentMethodValue.title}
                            {paymentMethodValue.value === "CARD" &&
                              paymentGatewayValue && (
                                <span className="text-ink-muted ml-2 font-normal">
                                  (via {paymentGatewayValue.title})
                                </span>
                              )}
                          </div>
                          {isCompleted && (
                            <Button
                              variant="outline"
                              className="text-sm mt-[-24px] px-4 py-2.5 h-10 border-2 rounded-full border-line! text-primary font-bold leading-5 tracking-[1.25%]"
                              onClick={() => setIsPaymentModalOpen(true)}
                            >
                              {CHECKOUT_CONST_TEXT.edit}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          className=" text-sm rounded-[40px] font-bold leading-5 tracking-[1.25%]"
                          onClick={() => setIsPaymentModalOpen(true)}
                        >
                          {CHECKOUT_CONST_TEXT.paymentPlaceHolder}
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      })}

      <AuthModals
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSuccess={(userData: NonNullable<UserType>) => {
          setUser(userData);
          setIsSignModalOpen(false);
          setCurrentStep(2);
          onAddressRefresh();
        }}
      />

      <ConfirmPopup
        open={showConfirmLogout}
        title={CHECKOUT_CONST_TEXT.logoutConfirmation}
        message={`${CHECKOUT_CONST_TEXT.logoutText} ${
          loggedInRole === "Admin"
            ? CHECKOUT_CONST_TEXT.admin
            : CHECKOUT_CONST_TEXT.servicePartner
        }. ${CHECKOUT_CONST_TEXT.toProceed}`}
        onClose={() => setShowConfirmLogout(false)}
        onConfirm={handleLogoutConfirm}
        saveText={CHECKOUT_CONST_TEXT.logout}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialSelectedId={address?.id}
        onSelect={(addr: NonNullable<AddressType>) => {
          setAddress(addr);
          setIsAddressModalOpen(false);
          setOtherDetails((prev: IOtherSlotDetails) => ({
            ...prev,
            addressId: Number(addr.id) || 0,
          }));
        }}
      />

      <SlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        duration={duration || 60}
        onSelect={(slot: { date: string; time: string }) => {
          setSlot(slot);
          setIsSlotModalOpen(false);
          setCurrentStep(4);
          setOtherDetails((prev: IOtherSlotDetails) => ({
            ...prev,
            slot,
          }));
        }}
        initialDate={slot?.date}
        initialTime={slot?.time}
      />

      <PaymentMethod
        value={paymentMethodValue}
        gatewayValue={paymentGatewayValue}
        onSelect={(m, g) => {
          setPaymentMethodValue(m);
          setPaymentGatewayValue(g);
          setCurrentStep(5);
          setOtherDetails({
            slot,
            addressId: Number(address?.id) || 0,
            paymentMethod: m.value,
            paymentGateway: g?.value || "",
          });
        }}
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
      />
    </div>
  );
};

export default CheckoutSteps;
