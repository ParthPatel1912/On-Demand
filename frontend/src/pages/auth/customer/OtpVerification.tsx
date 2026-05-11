import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import axios, { type AxiosResponse } from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import FormikTextField from "@/components/ui/formikTextfield";
import CustomerAuthLayout from "@/components/layout/auth/CustomerAuthLayout";
import CustomerCommonHeader from "@/components/ui/commonLoginHeadding";

import { APP_ROUTES } from "@/routes/config";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { otpSchema } from "@/schemas";
import { urlStrings } from "../config/constant";
import { saveAuthData } from "@/utils/auth";
import { OTP_EMAIL_KEY, OTP_LENGTH } from "@/utils/constants";
import { OTP_MESSAGES, CUSTOMER_LOGIN_MESSAGES } from "@/constants/auth.text";
import type { LocationState } from "@/types/auth/auth.type";

const getOtpEmail = (locationState: unknown) => {
  const stateEmail = (locationState as LocationState | null)?.email;
  const storedEmail = sessionStorage.getItem(OTP_EMAIL_KEY);
  return (stateEmail ?? storedEmail ?? "").trim();
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      OTP_MESSAGES.somethingWentWrong ||
      fallback
    );
  } else if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

const CustomerOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverStatus, setServerStatus] = useState<string | null>(null);

  const email = useMemo(() => getOtpEmail(location.state), [location.state]);

  const validateEmail = () => {
    if (!email) {
      setServerStatus(OTP_MESSAGES.missingEmail);
      return false;
    }
    return true;
  };

  const handleApiRequest = async ({
    url,
    payload,
    fallbackMessage,
    successMessage,
    onSuccess,
  }: {
    url: string;
    payload: Record<string, unknown>;
    fallbackMessage: string;
    successMessage?: string;
    onSuccess?: (response: AxiosResponse) => void;
  }) => {
    setServerStatus(null);

    if (!validateEmail()) return false;

    try {
      const response = await axiosInstanceLaravel.post(url, payload);

      if (response.data.success) {
        if (successMessage) {
          setServerStatus(successMessage);
        }
        onSuccess?.(response);
        return true;
      }

      setServerStatus(response.data?.message || fallbackMessage);
      return false;
    } catch (error: unknown) {
      setServerStatus(getErrorMessage(error, fallbackMessage));
      return false;
    }
  };

  const verifyOtp = async (otp: string) => {
    await handleApiRequest({
      url: urlStrings.customerVerifyOtp,
      payload: { email, otp },
      fallbackMessage: OTP_MESSAGES.verifyFailed,
      onSuccess: (response) => {
        saveAuthData(
          "customer",
          response.data.data.token,
          response.data.data.user,
        );
        toast.success(OTP_MESSAGES.loginSuccess);
        navigate(APP_ROUTES.HOME);
      },
    });
  };

  const handleResend = async () => {
    await handleApiRequest({
      url: urlStrings.customerResendOtp,
      payload: { email },
      fallbackMessage: OTP_MESSAGES.resendFailed,
      successMessage: OTP_MESSAGES.resendSuccess,
    });
  };

  const handleOtpChange = (value: string) => {
    const sanitizedValue = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    formik.setFieldValue("otp", sanitizedValue);
  };

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpSchema,
    onSubmit: async (values, helpers) => {
      await verifyOtp(values.otp);
      helpers.setSubmitting(false);
    },
  });

  const isSuccessMessage = serverStatus?.toLowerCase().includes("sent");

  return (
    <CustomerAuthLayout>
      <CustomerCommonHeader title={OTP_MESSAGES.enterOtpTitle} />

      <p
        className="w-90 text-center text-sm text-ink-muted leading-5 tracking-[0.0025em] font-normal mb-6"
      >
        {CUSTOMER_LOGIN_MESSAGES.fourDigitText}{" "}
        <span className="text-gray-700 break-all">
          {email || "your registered email"}
        </span>
      </p>

      {serverStatus && (
        <p
          className={`text-sm mb-2 text-center ${
            isSuccessMessage ? "text-green-600" : "text-red-600"
          }`}
        >
          {serverStatus}
        </p>
      )}

      <form noValidate onSubmit={formik.handleSubmit} className="space-y-4">
        <FormikTextField
          name="otp"
          placeholder={CUSTOMER_LOGIN_MESSAGES.enterOtpPlaceholder}
          formik={formik}
          type="text"
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          pattern="[0-9]*"
          onChange={(e) => handleOtpChange(e.target.value)}
          className="w-full max-w-full h-11 rounded-md border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-0 focus:border-gray-200"
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={formik.isSubmitting}
            className="w-1/2 h-11 rounded-full text-sm disabled:opacity-60 text-primary font-bold leading-5 tracking-[1.25%]"

          >
            {OTP_MESSAGES.resendOtpBtn}
          </Button>

          <Button
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid}
            className="text-sm w-1/2 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 font-bold leading-5 tracking-[1.25%] text-white"

          >
            {formik.isSubmitting ? OTP_MESSAGES.verifying : OTP_MESSAGES.signInBtn}
          </Button>
        </div>

        <p className="text-sm text-center mt-3 font-normal leading-5 tracking-[0.25%] text-ink-muted">
          {CUSTOMER_LOGIN_MESSAGES.acceptSignIn}{" "}
          <span
            className="text-sm font-bold leading-5 tracking-[0.1%] text-primary cursor-pointer"
            onClick={() =>
              window.open(APP_ROUTES.TERMS_AND_CONDITIONS, "_blank")
            }
          >
            {CUSTOMER_LOGIN_MESSAGES.tearmsConditionsText}
          </span>{" "}
          &{" "}
          <span
            className="text-sm font-bold leading-5 tracking-[0.1%] text-primary cursor-pointer"
            onClick={() => window.open(APP_ROUTES.PRIVACY_POLICY, "_blank")}
          >
            {CUSTOMER_LOGIN_MESSAGES.privacyPolicyText}
          </span>
        </p>
      </form>
    </CustomerAuthLayout>
  );
};

export default CustomerOtp;
