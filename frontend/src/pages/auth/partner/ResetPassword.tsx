import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import DynamicFormFields from "@/components/common/DynamicFormFields";
import { partnerResetPasswordSchema } from "@/schemas";
import { adminLoginStyles } from "../config/auth.styles";
import AdminAuthLayout from "@/components/layout/auth/AdminAuthLayout";
import {
  urlStrings,
  partnerResetPasswordFields,
} from "../config/constant";
import axiosInstance from "@/helper/axiosInstance";
import { APP_ROUTES } from "@/routes/config";
import AdminCommonHeader from "@/components/auth/AdminCommonHeader";
import { ADMIN_AUTH_BUTTON_TEXTS, ADMIN_AUTH_TEXTS } from "@/constants/auth.text";

const ServicePartnerResetPassword = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = search.split("token=")[1] || "";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        navigate(APP_ROUTES.SERVICE_PARTNER_LOGIN);
        toast.error("Invalid or missing token");
        return;
      }
    };
    verifyUser();
  }, [token, navigate]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: partnerResetPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await axiosInstance.post(
          urlStrings.servicePartnerResetPassword,
          {
            token: token,
            newPassword: values.confirmPassword,
          },
        );
        if (res.data.success) {
          toast.success("Password reset successful. Please log in.");
          navigate(APP_ROUTES.SERVICE_PARTNER_LOGIN);
        }
      } catch (error) {
        console.error("Reset password error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const navigateToLogin = () => {
    navigate(APP_ROUTES.SERVICE_PARTNER_LOGIN);
  };

  return (
    <AdminAuthLayout>
      {loading && (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin" />
        </div>
      )}
      <AdminCommonHeader title={ADMIN_AUTH_TEXTS.resetPasswordHeaderTitle} />

      <form
        noValidate
        onSubmit={formik.handleSubmit}
        className={adminLoginStyles.form}
      >
        <DynamicFormFields
          fields={partnerResetPasswordFields}
          formik={formik}
        />

        <Button
          type="submit"
          disabled={
            formik.isSubmitting ||
            !formik.values.password?.trim() ||
            !formik.values.confirmPassword?.trim()
          }
          className={adminLoginStyles.submitButton}
        >
          {formik.isSubmitting
            ? ADMIN_AUTH_BUTTON_TEXTS.resetting
            : ADMIN_AUTH_BUTTON_TEXTS.resetPassword}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={navigateToLogin}
          className="text-sm text-slate-600 hover:text-slate-800"
        >
          {ADMIN_AUTH_BUTTON_TEXTS.backToLogin}
        </button>
      </div>
    </AdminAuthLayout>
  );
}

export default ServicePartnerResetPassword;
