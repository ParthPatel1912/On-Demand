import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import DynamicFormFields from "@/components/common/DynamicFormFields";
import { adminLoginStyles } from "../config/auth.styles";
import AdminAuthLayout from "@/components/layout/auth/AdminAuthLayout";
import { forgotPasswordSchema } from "@/schemas";
import { forgotPasswordFields, urlStrings } from "../config/constant";
import axiosInstance from "@/helper/axiosInstance";
import { APP_ROUTES } from "@/routes/config";
import AdminCommonHeader from "@/components/auth/AdminCommonHeader";
import { ADMIN_AUTH_BUTTON_TEXTS, ADMIN_AUTH_TEXTS } from "@/constants/auth.text";

const ServicePartnerForgotPassword = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setErrors }) => {
      setServerError(null);
      try {
        const response = await axiosInstance.post(
          urlStrings.servicePartnerForgotPassword,
          values
        );
        if (response.data.success) {
          setIsSuccess(true);
          setMessage(response.data.message);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data;
          
          if (responseData?.error) {
            const formikErrors: Record<string, string> = {};
            Object.entries(responseData.error).forEach(([field, message]) => {
              formikErrors[field] = message as string;
            });
            setErrors(formikErrors);
          }

          const message =
            responseData?.message ||
            error.message ||
            ADMIN_AUTH_TEXTS.somethingWentWrong;

          setServerError(message);
        }
      }
    },
  });

  const navigateToLogin = () => {
    navigate(APP_ROUTES.SERVICE_PARTNER_LOGIN);
  };

  if (isSuccess) {
    return (
      <AdminAuthLayout>
        <div className="text-center space-y-4">
          <AdminCommonHeader
            title={ADMIN_AUTH_TEXTS.emailSentTitle}
            subtitle={message}
          />
          <Button
            onClick={navigateToLogin}
            className={adminLoginStyles.submitButton}
          >
            {ADMIN_AUTH_BUTTON_TEXTS.backToLogin}
          </Button>
        </div>
      </AdminAuthLayout>
    );
  }

  return (
    <AdminAuthLayout>
      <AdminCommonHeader
        title={ADMIN_AUTH_TEXTS.forgotPasswordTitle}
        subtitle={ADMIN_AUTH_TEXTS.forgotPasswordSubtitle}
      />

      {serverError && (
        <p className={adminLoginStyles.serverError}>{serverError}</p>
      )}

      <form
        noValidate
        onSubmit={formik.handleSubmit}
        className={adminLoginStyles.form}
      >
        <DynamicFormFields
          fields={forgotPasswordFields}
          formik={formik}
        />

        <Button
          type="submit"
          disabled={formik.isSubmitting || !formik.values.email?.trim()}
          className={adminLoginStyles.submitButton}
        >
          {formik.isSubmitting ? ADMIN_AUTH_BUTTON_TEXTS.sending : ADMIN_AUTH_BUTTON_TEXTS.sendResetLink}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={navigateToLogin}
          className="text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
        >
          {ADMIN_AUTH_BUTTON_TEXTS.backToLogin}
        </button>
      </div>
    </AdminAuthLayout>
  );
};

export default ServicePartnerForgotPassword;
