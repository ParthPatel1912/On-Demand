import React from "react";
import { useFormik } from "formik";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { otpSchema } from "@/schemas";
import type { VerifyOtpProps } from "@/types/auth/index.interface";

export const VerifyOTPModal = ({
  open,
  onClose,
  onVerify,
  receivedText,
  apiEndpoint = "customer/profile/verify-email-update",
  payloadKey = "email",
  successMessage = "Email updated successfully",
}: VerifyOtpProps) => {
  const [submitting, setSubmitting] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: otpSchema,
    onSubmit: async (values, { setFieldError, setErrors, setTouched }) => {
      try {
        setSubmitting(true);
        await axiosInstanceLaravel.post(apiEndpoint, {
          [payloadKey]: receivedText,
          otp: `${values.otp}`,
        });
        import("react-hot-toast").then(({ default: toast }) => {
          toast.success(successMessage);
        });
        onVerify(values.otp);
      } catch (error: unknown) {
        console.error("OTP verification error:", error);
        const axiosError = error as AxiosError<{
          errors?: Record<string, string[]>;
          message?: string;
        }>;

        if (axiosError.response?.data?.errors) {
          const backendErrors = axiosError.response.data.errors;
          const formikErrors: Record<string, string> = {};
          const formikTouched: Record<string, boolean> = {};
          Object.keys(backendErrors).forEach((key) => {
            formikErrors[key] = backendErrors[key][0];
            formikTouched[key] = true;
          });
          setErrors(formikErrors);
          setTouched(formikTouched);
        } else if (axiosError.response?.data?.message) {
          setFieldError("otp", axiosError.response.data.message);
        } else {
          import("react-hot-toast").then(({ default: toast }) => {
            toast.error("Failed to verify OTP");
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <CommonPopup
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Verify OTP"
      className="sm:max-w-[400px] max-w-[400px]"
      onSave={formik.handleSubmit}
      saveText="Verify"
      onCancel={onClose}
      buttonRounded="full"
      variant="fullWidth"
      onlyOneButton={true}
      loading={submitting}
      isSaveDisabled={!formik.dirty || !formik.isValid}
    >
      <div className="py-4 space-y-6">
        <p className="text-sm leading-relaxed text-slate-500 font-alexandria">
          We have sent you a 4 to 6 digit code on{" "}
          <div className="text-ink font-bold">{receivedText}</div>
        </p>
        <div className="pt-2">
          <FloatingLabelInput
            label="Enter OTP"
            name="otp"
            type="number"
            value={formik.values.otp}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (formik.dirty && formik.isValid && !submitting) {
                  formik.handleSubmit();
                }
              }
            }}
            error={formik.touched.otp ? formik.errors.otp : undefined}
            className="bg-surface-elevated"
          />
        </div>
      </div>
    </CommonPopup>
  );
};
