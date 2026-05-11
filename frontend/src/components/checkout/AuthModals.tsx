import { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import { Mail } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormikTextField from "@/components/ui/formikTextfield";

import { customerLoginSchema, otpSchema } from "@/schemas";
import { APP_ROUTES } from "@/routes/config";
import { saveAuthData } from "@/utils/auth";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { urlStrings } from "@/pages/auth/config/constant";
import type { IProps } from "@/types/auth/index.interface";
import { OTP_LENGTH } from "@/utils/constants";
import {
  AUTH_MODAL_MESSAGES,
  CUSTOMER_LOGIN_MESSAGES,
} from "@/constants/auth.text";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return fallback;
};

const AuthModals = ({ isOpen, onClose, onSuccess }: IProps) => {
  const [step, setStep] = useState<"signin" | "otp">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<{
    message: string;
    data: { name: string; email: string } | null;
  } | null>(null);

  const resetMessages = () => {
    setServerError(null);
    setServerSuccess(null);
  };

  const resetState = () => {
    setStep("signin");
    resetMessages();
    setApiResponse(null);
    signinFormik.resetForm();
    otpFormik.resetForm();
  };

  const handleOtpChange = (value: string) => {
    const sanitizedValue = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    otpFormik.setFieldValue("otp", sanitizedValue);
  };

  // SIGNIN FORM
  const signinFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema: customerLoginSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      resetMessages();
      setApiResponse(null);

      try {
        const response = await axiosInstanceLaravel.post(
          urlStrings.customerLogin,
          values,
        );

        if (response.data.success) {
          otpFormik.setFieldValue("email", values.email);
          setStep("otp");

          setApiResponse({
            message: response.data.message,
            data: response.data.data,
          });
        } else {
          setServerError(
            response.data?.message || AUTH_MODAL_MESSAGES.sendOtpFailed,
          );
        }
      } catch (error: unknown) {
        setServerError(
          getErrorMessage(error, AUTH_MODAL_MESSAGES.sendOtpFailed),
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  // OTP FORM
  const otpFormik = useFormik({
    initialValues: {
      email: "",
      otp: "",
    },
    validationSchema: otpSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      resetMessages();

      try {
        const response = await axiosInstanceLaravel.post(
          urlStrings.customerVerifyOtp,
          values,
        );

        if (response.data.success) {
          saveAuthData(
            "customer",
            response.data.data.token,
            response.data.data.user,
          );

          onSuccess({
            name: response.data.data.user?.name || "",
            email: values.email,
          });

          resetMessages();
        } else {
          setServerError(
            response.data?.message || AUTH_MODAL_MESSAGES.verifyOtpFailed,
          );
        }
      } catch (error: unknown) {
        setServerError(
          getErrorMessage(error, AUTH_MODAL_MESSAGES.verifyOtpFailed),
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResend = async () => {
    if (!otpFormik.values.email) return;

    setResendLoading(true);
    setServerError(null);
    setServerSuccess(null);

    try {
      const response = await axiosInstanceLaravel.post(
        urlStrings.customerResendOtp,
        {
          email: otpFormik.values.email,
        },
      );

      if (response.data.success) {
        setServerSuccess(
          response.data?.message || AUTH_MODAL_MESSAGES.resendOtp,
        );
      } else {
        setServerError(
          response.data?.message || AUTH_MODAL_MESSAGES.resendOtpFailed,
        );
      }
    } catch (error: unknown) {
      setServerError(
        getErrorMessage(error, AUTH_MODAL_MESSAGES.resendOtpFailed),
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTimeout(resetState, 300);
        }
      }}
    >
      <DialogContent className="w-100 max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg leading-6.5 font-bold tracking-[0.15%] text-ink">
            {step === "signin"
              ? AUTH_MODAL_MESSAGES.signInTitle
              : AUTH_MODAL_MESSAGES.verifyOtpTitle}
          </DialogTitle>
        </DialogHeader>

        {serverError && (
          <p className="text-sm text-red-500 text-center wrap-break-word">
            {serverError}
          </p>
        )}
        {serverSuccess && (
          <p className="text-sm text-green-500 text-center wrap-break-word">
            {serverSuccess}
          </p>
        )}

        {step === "signin" ? (
          <form
            onSubmit={signinFormik.handleSubmit}
            className="space-y-4 mt-2 w-full"
          >
            <FormikTextField
              name="name"
              placeholder="Name"
              formik={signinFormik}
              className="h-11 rounded-md border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-0 focus:border-gray-200 mb-2"
            />

            <FormikTextField
              name="email"
              placeholder="Email"
              leftIcon={<Mail size={18} />}
              formik={signinFormik}
              className="h-11 rounded-md border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-0 focus:border-gray-200"
            />

            {apiResponse && (
              <div className="mt-1 text-sm text-green-600 wrap-break-word">
                <p>{apiResponse.message}</p>
                {apiResponse.data && (
                  <p>
                    Name: {apiResponse.data.name} <br />
                    Email: {apiResponse.data.email}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-[40px] py-3.4 px-6 flex items-center justify-center gap-2.5"
              disabled={isLoading || !signinFormik.isValid}
            >
              {isLoading
                ? AUTH_MODAL_MESSAGES.sending
                : AUTH_MODAL_MESSAGES.getOtp}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={otpFormik.handleSubmit}
            className="space-y-4 mt-2 w-full overflow-hidden"
          >
            <p className="text-sm leading-5 font-normal tracking-[0.25%] text-ink-muted wrap-break-word">
              {CUSTOMER_LOGIN_MESSAGES.fourDigitText}{" "}
              <span className="break-all font-medium text-ink-muted">
                {otpFormik.values.email}
              </span>
            </p>

            <div className="w-full">
              <FormikTextField
                name="otp"
                placeholder="Enter OTP"
                formik={otpFormik}
                type="text"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                pattern="[0-9]*"
                onChange={(e) => handleOtpChange(e.target.value)}
                className="w-full max-w-full h-11 rounded-md border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-0 focus:border-gray-200"
              />
            </div>

            <p className="text-sm leading-5 font-normal tracking-[0.25%] text-ink-muted mt-4 wrap-break-word">
              {CUSTOMER_LOGIN_MESSAGES.acceptSignIn}{" "}
              <span
                className="text-primary font-bold text-sm leading-5 tracking-[0.1%] cursor-pointer hover:underline"
                onClick={() =>
                  window.open(APP_ROUTES.TERMS_AND_CONDITIONS, "_blank")
                }
              >
                {CUSTOMER_LOGIN_MESSAGES.tearmsConditionsText}
              </span>{" "}
              &{" "}
              <span
                className="text-primary font-bold text-sm leading-5 tracking-[0.1%] cursor-pointer hover:underline"
                onClick={() => window.open(APP_ROUTES.PRIVACY_POLICY, "_blank")}
              >
                {CUSTOMER_LOGIN_MESSAGES.privacyPolicyText}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-1/2 h-11 rounded-full py-3.5 px-6 border-2 border-line bg-white text-primary mt-2 font-alexandria font-bold text-sm flex items-center justify-center"
                disabled={resendLoading}
                onClick={handleResend}
              >
                {resendLoading
                  ? AUTH_MODAL_MESSAGES.resending
                  : AUTH_MODAL_MESSAGES.resendOtp}
              </Button>

              <Button
                type="submit"
                className="w-full sm:w-1/2 h-11 rounded-full py-3.5 px-6 flex items-center justify-center gap-2.5 mt-2 bg-primary text-white"
                disabled={isLoading || !otpFormik.isValid}
              >
                {isLoading
                  ? AUTH_MODAL_MESSAGES.verifying
                  : AUTH_MODAL_MESSAGES.verifyAndSignIn}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModals;
