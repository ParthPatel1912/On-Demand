import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePasswordSchema } from "@/schemas";
import type { IChangePasswordProps } from "@/types/auth/index.interface";

const ChangePasswordPopup = ({
  open,
  onOpenChange,
  loading,
  onSave,
  onCancel,
}: IChangePasswordProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setErrors, setTouched }) => {
      try {
        await onSave(
          values.currentPassword,
          values.newPassword,
          values.confirmPassword
        );
      } catch (err: unknown) {
        console.error("Save user error:", err);
        const axiosError = err as AxiosError<{ errors?: Record<string, string[]> }>;
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
      }
    },
  });
  const isPasswordSaveEnabled =
    passwordFormik.values.newPassword &&
    passwordFormik.values.confirmPassword &&
    !loading;

  useEffect(() => {
    if (!open) passwordFormik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <CommonPopup
      className="w-100"
      open={open}
      onOpenChange={onOpenChange}
      title="Change Password"
      loading={loading}
      onSave={passwordFormik.handleSubmit}
      onCancel={() => {
        passwordFormik.resetForm();
        onCancel();
      }}
      saveText="Update Password"
      footer={
        <div className="flex w-full gap-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              passwordFormik.resetForm();
              onCancel();
            }}
          >
            Cancel
          </Button>

          <Button
            className="flex-1"
            onClick={() => passwordFormik.handleSubmit()}
            disabled={!isPasswordSaveEnabled}
          >
            {loading ? "Loading..." : "Save"}
          </Button>
        </div>
      }
    >
      <FloatingLabelInput
        type={showCurrentPassword ? "text" : "password"}
        label="Current Password"
        name="currentPassword"
        value={passwordFormik.values.currentPassword}
        onChange={(e) => {
          passwordFormik.handleChange(e);
          passwordFormik.setFieldError("currentPassword", undefined);
        }}
        rightAddon={
          <button
            type="button"
            className="cursor-pointer hover:text-ink-mid"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-5.5 w-5.5" />
            ) : (
              <Eye className="h-5.5 w-5.5" />
            )}
          </button>
        }
        className="pr-0"
        rightAddonClassName="bg-transparent text-ink-subtle"
        error={
          passwordFormik.touched.currentPassword &&
          passwordFormik.errors.currentPassword
            ? passwordFormik.errors.currentPassword
            : undefined
        }
      />

      <FloatingLabelInput
        type={showNewPassword ? "text" : "password"}
        label="New Password"
        name="newPassword"
        value={passwordFormik.values.newPassword}
        onChange={(e) => {
          passwordFormik.handleChange(e);
          passwordFormik.setFieldError("newPassword", undefined);
          passwordFormik.setFieldError("confirmPassword", undefined);
        }}
        rightAddon={
          <button
            type="button"
            className="cursor-pointer hover:text-ink-mid"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-5.5 w-5.5" />
            ) : (
              <Eye className="h-5.5 w-5.5" />
            )}
          </button>
        }
        className="pr-0"
        rightAddonClassName="bg-transparent text-ink-subtle"
        error={
          passwordFormik.touched.newPassword &&
          passwordFormik.errors.newPassword
            ? passwordFormik.errors.newPassword
            : undefined
        }
      />

      <FloatingLabelInput
        type={showConfirmPassword ? "text" : "password"}
        label="Confirm Password"
        name="confirmPassword"
        value={passwordFormik.values.confirmPassword}
        onChange={(e) => {
          passwordFormik.handleChange(e);
          passwordFormik.setFieldError("confirmPassword", undefined);
        }}
        rightAddon={
          <button
            type="button"
            className="cursor-pointer hover:text-ink-mid"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5.5 w-5.5" />
            ) : (
              <Eye className="h-5.5 w-5.5" />
            )}
          </button>
        }
        className="pr-0"
        rightAddonClassName="bg-transparent text-ink-subtle"
        error={
          passwordFormik.touched.confirmPassword &&
          passwordFormik.errors.confirmPassword
            ? passwordFormik.errors.confirmPassword
            : undefined
        }
      />
    </CommonPopup>
  );
};

export default ChangePasswordPopup;
