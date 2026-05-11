import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import FormikTextField from "@/components/ui/formikTextfield";
import { APP_ROUTES } from "@/routes/config";
import CustomerAuthLayout from "@/components/layout/auth/CustomerAuthLayout";
import CustomerCommonHeader from "@/components/ui/commonLoginHeadding";
import { customerLoginSchema } from "@/schemas";
import { urlStrings } from "../config/constant";
import { OTP_EMAIL_KEY } from "@/utils/constants";
import { CUSTOMER_LOGIN_MESSAGES } from "@/constants/auth.text";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return fallback;
};

const CustomerLogin = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema: customerLoginSchema,
    onSubmit: async (values, helpers) => {
      setServerError(null);

      try {
        const response = await axiosInstanceLaravel.post(
          urlStrings.customerLogin,
          values,
        );

        if (response.data.success) {
          sessionStorage.setItem(OTP_EMAIL_KEY, values.email);
          navigate(APP_ROUTES.CUSTOMER_OTP, {
            state: { email: values.email },
          });
        } else {
          setServerError(
            response.data?.message || CUSTOMER_LOGIN_MESSAGES.loginFailed,
          );
        }
      } catch (error: unknown) {
        setServerError(
          getErrorMessage(error, CUSTOMER_LOGIN_MESSAGES.loginFailed),
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <CustomerAuthLayout>
      <CustomerCommonHeader title={CUSTOMER_LOGIN_MESSAGES.title} />

      {serverError && (
        <p className="text-sm text-red-500 text-center mb-3">{serverError}</p>
      )}

      <form noValidate onSubmit={formik.handleSubmit} className="space-y-4">
        <FormikTextField
          name="name"
          placeholder={CUSTOMER_LOGIN_MESSAGES.namePlaceholder}
          formik={formik}
          className="h-11 rounded-md border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-0 focus:border-gray-200"
        />

        <FormikTextField
          name="email"
          placeholder={CUSTOMER_LOGIN_MESSAGES.emailPlaceholder}
          leftIcon={<Mail size={18} />}
          formik={formik}
          className="h-11 rounded-md border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-0 focus:border-gray-200"
        />

        <Button
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-medium"
        >
          {formik.isSubmitting
            ? CUSTOMER_LOGIN_MESSAGES.sending
            : CUSTOMER_LOGIN_MESSAGES.getOtp}
        </Button>
      </form>

      <p className="text-center mt-4 font-alexandria font-normal text-sm leading-5 tracking-[0.25%] text-ink-muted">
        {CUSTOMER_LOGIN_MESSAGES.acceptSignIn}{" "}
        <span
          className="font-alexandria font-bold text-sm leading-5 tracking-[0.001em] text-primary cursor-pointer"
          onClick={() => navigate(APP_ROUTES.TERMS_AND_CONDITIONS)}
        >
          {CUSTOMER_LOGIN_MESSAGES.tearmsConditionsText}
        </span>{" "}
        &{" "}
        <span
          className="font-alexandria font-bold text-sm leading-5 tracking-[0.001em] text-primary cursor-pointer"
          onClick={() => navigate(APP_ROUTES.PRIVACY_POLICY)}
        >
          {CUSTOMER_LOGIN_MESSAGES.privacyPolicyText}
        </span>
      </p>

      <div className="flex items-center gap-2 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <p className="pb-2 text-center text-base leading-5.5 font-semibold text-ink-muted font-alexandria tracking-[0.15%]">
        {CUSTOMER_LOGIN_MESSAGES.areYouServicePartenerText}
        <br />
        <span
          className="font-alexandria font-bold text-sm leading-5 tracking-[0.001em] text-primary cursor-pointer"
          onClick={() => navigate(APP_ROUTES.SERVICE_PARTNER_SIGNUP)}
        >
          {CUSTOMER_LOGIN_MESSAGES.joinNowText}
        </span>
      </p>
    </CustomerAuthLayout>
  );
};

export default CustomerLogin;
