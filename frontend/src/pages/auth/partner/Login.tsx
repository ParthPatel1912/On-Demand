import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import DynamicFormFields from "@/components/common/DynamicFormFields";
import { partnerLoginSchema } from "@/schemas";
import { adminLoginStyles } from "../config/auth.styles";
import AdminAuthLayout from "@/components/layout/auth/AdminAuthLayout";
import { adminLoginFields, urlStrings } from "../config/constant";
import { APP_ROUTES } from "@/routes/config";
import axiosInstance from "@/helper/axiosInstance";
import AdminCommonHeader from "@/components/auth/AdminCommonHeader";
import { ADMIN_AUTH_BUTTON_TEXTS } from "@/constants/auth.text";

const ServicePartnerLogin = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: partnerLoginSchema,
    onSubmit: async (values) => {
      try {
        const response = await axiosInstance.post(
          urlStrings.servicePartnerLogin,
          values,
        );
        if (response.data.success) {
          toast.success("Login successful!");
          localStorage.setItem("partnerToken", response.data.data.token);
          localStorage.setItem(
            "partnerinfo",
            JSON.stringify(response.data.data.user),
          );
          navigate(APP_ROUTES.SERVICE_PARTNER_DASHBOARD);
        }
      } catch (error: unknown) {
        console.error("Login error:", error);
      }
    },
  });

  const navigateToForgot = () => {
    navigate(APP_ROUTES.SERVICE_PARTNER_FORGOT_PASSWORD);
  };

  return (
    <AdminAuthLayout>
      <AdminCommonHeader title="Partner Login" />

      <form
        noValidate
        onSubmit={formik.handleSubmit}
        className={adminLoginStyles.form}
      >
        <DynamicFormFields fields={adminLoginFields} formik={formik} />

        <div className={adminLoginStyles.forgotRow}>
          <button
            type="button"
            className={adminLoginStyles.forgotButton}
            onClick={navigateToForgot}
          >
            {ADMIN_AUTH_BUTTON_TEXTS.forgotPassword}
          </button>
        </div>

        <Button
          type="submit"
          disabled={
            formik.isSubmitting ||
            !formik.values.email?.trim() ||
            !formik.values.password?.trim()
          }
          className={adminLoginStyles.submitButton}
        >
          {formik.isSubmitting
            ? ADMIN_AUTH_BUTTON_TEXTS.signingIn
            : ADMIN_AUTH_BUTTON_TEXTS.signIn}
        </Button>
      </form>
    </AdminAuthLayout>
  );
}

export default ServicePartnerLogin;
