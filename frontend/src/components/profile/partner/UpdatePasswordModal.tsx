import { useState } from "react";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePasswordSchema } from "@/schemas";
import { updatePassword } from "@/api/partnerProfile";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UpdatePasswordModal = ({ open, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: updatePasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { resetForm, setErrors, setTouched }) => {
      try {
        setLoading(true);
        const response = await updatePassword({
          current_password: values.currentPassword,
          password: values.newPassword,
          password_confirmation: values.confirmPassword,
        });
        if (response.data?.success) {
          toast.success(
            response.data?.message || "Password changed successfully."
          );
          resetForm();
          onClose();
        }
      } catch (err: unknown) {
        console.error("Error while change password:", err);
        const axiosError = err as AxiosError<{
          errors?: Record<string, string[]>;
        }>;
        if (axiosError.response?.data?.errors) {
          const backendErrors = axiosError.response.data.errors;
          const map: Record<string, string> = {
            current_password: "currentPassword",
            password: "newPassword",
            password_confirmation: "confirmPassword",
          };
          const formikErrors: Record<string, string> = {};
          const formikTouched: Record<string, boolean> = {};
          Object.keys(backendErrors).forEach((key) => {
            const formikKey = map[key] || key;
            formikErrors[formikKey] = backendErrors[key][0];
            formikTouched[formikKey] = true;
          });
          setErrors(formikErrors);
          setTouched(formikTouched);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const isPasswordSaveEnabled =
    formik.values.currentPassword &&
    formik.values.newPassword &&
    formik.values.confirmPassword &&
    !loading;

  return (
    <CommonPopup
      className="w-100"
      open={open}
      onOpenChange={handleClose}
      title="Change Password"
      loading={loading}
      footer={
        <div className="flex w-full gap-4">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => formik.handleSubmit()}
            disabled={!isPasswordSaveEnabled}
          >
            {loading ? "Loading..." : "Save"}
          </Button>
        </div>
      }
    >
      <div>
        <FloatingLabelInput
          type={showCurrentPassword ? "text" : "password"}
          label="Current Password"
          name="currentPassword"
          value={formik.values.currentPassword}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("currentPassword", undefined);
          }}
          rightAddon={
            <button
              type="button"
              className="cursor-pointer hover:text-ink-mid"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-[22px] w-[22px]" />
              ) : (
                <Eye className="h-[22px] w-[22px]" />
              )}
            </button>
          }
          className="pr-0"
          rightAddonClassName="bg-transparent text-ink-subtle"
        />
        {formik.touched.currentPassword && formik.errors.currentPassword && (
          <p className="text-xs text-red-500 mt-1">
            {formik.errors.currentPassword}
          </p>
        )}
      </div>
      <div>
        <FloatingLabelInput
          type={showNewPassword ? "text" : "password"}
          label="New Password"
          name="newPassword"
          value={formik.values.newPassword}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("newPassword", undefined);
          }}
          rightAddon={
            <button
              type="button"
              className="cursor-pointer hover:text-ink-mid"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-[22px] w-[22px]" />
              ) : (
                <Eye className="h-[22px] w-[22px]" />
              )}
            </button>
          }
          className="pr-0"
          rightAddonClassName="bg-transparent text-ink-subtle"
        />
        {formik.touched.newPassword && formik.errors.newPassword && (
          <p className="text-xs text-red-500 mt-1">
            {formik.errors.newPassword}
          </p>
        )}
      </div>
      <div>
        <FloatingLabelInput
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          name="confirmPassword"
          value={formik.values.confirmPassword}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("confirmPassword", undefined);
          }}
          rightAddon={
            <button
              type="button"
              className="cursor-pointer hover:text-ink-mid"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-[22px] w-[22px]" />
              ) : (
                <Eye className="h-[22px] w-[22px]" />
              )}
            </button>
          }
          className="pr-0"
          rightAddonClassName="bg-transparent text-ink-subtle"
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            {formik.errors.confirmPassword}
          </p>
        )}
      </div>
    </CommonPopup>
  );
};

export default UpdatePasswordModal;
