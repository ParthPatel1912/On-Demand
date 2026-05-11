import React from "react";
import { useFormik } from "formik";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { profileEmailSchema } from "@/schemas";

interface IProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newText: string) => void;
  currentEmail?: string;
  apiEndpoint?: string;
}

export const ChangeEmailModal = ({
  open,
  onClose,
  onSuccess,
  currentEmail,
  apiEndpoint = "customer/profile/change-email",
}: IProps) => {
  const [submitting, setSubmitting] = React.useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: currentEmail || "",
    },
    validationSchema: profileEmailSchema,
    onSubmit: async (values, { setErrors, setTouched }) => {
      try {
        setSubmitting(true);
        await axiosInstanceLaravel.patch(apiEndpoint, {
          email: values.email,
        });
        import("react-hot-toast").then(({ default: toast }) => {
          toast.success("OTP sent to new email address");
        });
        onSuccess?.(values.email);
        onClose();
      } catch (error: unknown) {
        console.error("Change email error:", error);
        const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
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
      title={currentEmail ? "Change Email" : "Add Email"}
      className="sm:max-w-100 max-w-100"
      onSave={formik.handleSubmit}
      saveText="Save"
      variant="fullWidth"
      onCancel={onClose}
      buttonRounded="full"
      onlyOneButton={true}
      loading={submitting}
      isSaveDisabled={!formik.dirty || !formik.isValid}
    >
      <div className="py-4">
        <FloatingLabelInput
          label="New Email"
          name="email"
          value={formik.values.email}
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
          error={formik.touched.email ? formik.errors.email : undefined}
          className="bg-surface-elevated"
        />
      </div>
    </CommonPopup>
  );
};
