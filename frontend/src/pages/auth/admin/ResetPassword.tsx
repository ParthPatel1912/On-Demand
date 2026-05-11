import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import DynamicFormFields from "@/components/common/DynamicFormFields";
import { resetPasswordSchema } from "@/schemas";
import { adminLoginStyles } from "../config/auth.styles";
import AdminAuthLayout from "@/components/layout/auth/AdminAuthLayout";
import {
  resetPasswordFields,
  urlStrings,
} from "../config/constant";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { APP_ROUTES } from "@/routes/config";
import { cn } from "@/lib/utils";
import AdminCommonHeader from "@/components/auth/AdminCommonHeader";
import { ADMIN_AUTH_BUTTON_TEXTS, ADMIN_AUTH_TEXTS } from "@/constants/auth.text";


const AdminResetPassword = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = pathname.split("token=")[1] || "";
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      setServerError(null);
      setLoading(true);
      try {
        const res = await axiosInstanceLaravel.post(
          urlStrings.adminResetPassword,
          {
            token: resetToken,
            password: values.password,
            email,
            password_confirmation: values.confirmPassword,
          },
        );
        if (res.data.success) {
          setIsSuccess(true);
          setTimeout(() => {
            navigate(APP_ROUTES.ADMIN_LOGIN);
          }, 2000);
        }
      } catch (error) {
        setServerError(
          error instanceof Error
            ? error.message
            : ADMIN_AUTH_TEXTS.somethingWentWrong,
        );
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsExpired(true);
        return;
      }
      setLoading(true);
      try {
        const res = await axiosInstanceLaravel.post(
          urlStrings.adminVerifyResetToken,
          { token },
        );
        if (res.data?.success) {
          const { email, reset_token } = res.data.data;
          setEmail(email);
          setResetToken(reset_token);
          formik.setFieldValue("email", email);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setIsExpired(true);
          setServerError(error.response?.data?.message || error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, [token]);

  const navigateToLogin = () => {
    navigate(APP_ROUTES.ADMIN_LOGIN);
  };

  const navigateToForgot = () => {
    navigate(APP_ROUTES.ADMIN_FORGOT_PASSWORD);
  };

  if (isExpired) {
    return (
      <AdminAuthLayout>
        <div className="text-center space-y-4 w-fit">
          <AdminCommonHeader title={ADMIN_AUTH_TEXTS.linkExpiredTitle} />
          <p className={cn(adminLoginStyles.serverError)}>{serverError}</p>
          <Button
            onClick={navigateToForgot}
            className={adminLoginStyles.submitButton}
          >
            {ADMIN_AUTH_BUTTON_TEXTS.requestNewLink}
          </Button>
        </div>
      </AdminAuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AdminAuthLayout>
        <div className="text-center space-y-4">
          <AdminCommonHeader title={ADMIN_AUTH_TEXTS.passwordResetSubtitle} />
          <div className="flex justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        </div>
      </AdminAuthLayout>
    );
  }

  return (
    <AdminAuthLayout>
      {loading && (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin" />
        </div>
      )}
      <AdminCommonHeader
        title={ADMIN_AUTH_TEXTS.resetPasswordHeaderTitle}
        subtitle={ADMIN_AUTH_TEXTS.resetPasswordHeaderSubtitle}
      />

      {serverError && (
        <p className={adminLoginStyles.serverError}>{serverError}</p>
      )}

      <form
        noValidate
        onSubmit={formik.handleSubmit}
        className={adminLoginStyles.form}
      >
        <DynamicFormFields fields={resetPasswordFields} formik={formik} />

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
};

export default AdminResetPassword;
