import React from "react";
import { useFormik } from "formik";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { profileMobileSchema } from "@/schemas";
import type { IChangeMobileProps } from "@/types/common.interface";


export const ChangeMobileModal = ({
  open,
  onClose,
  onSuccess,
  currentMobile,
  apiEndpoint = "customer/profile/change-mobile",
  successMessage = "Mobile number changed successfully",
}: IChangeMobileProps) => {
  const [submitting, setSubmitting] = React.useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      mobile: currentMobile || "",
    },
    validationSchema: profileMobileSchema,
    onSubmit: async (values, { setErrors, setTouched }) => {
      try {
        setSubmitting(true);
        await axiosInstanceLaravel.patch(apiEndpoint, {
          mobile_number: values.mobile,
        });
        import("react-hot-toast").then(({ default: toast }) => {
          toast.success(
            currentMobile ? successMessage : "Mobile number added successfully"
          );
        });
        onSuccess?.(values.mobile);
        onClose();
      } catch (error: unknown) {
        console.error("Change mobile error:", error);
        const axiosError = error as AxiosError<{
          errors?: Record<string, string[]>;
          message?: string;
        }>;
        if (axiosError.response?.data?.errors) {
          const backendErrors = axiosError.response.data.errors;
          const formikErrors: Record<string, string> = {};
          const formikTouched: Record<string, boolean> = {};
          Object.keys(backendErrors).forEach((key) => {
            const formikKey = key === "mobile_number" ? "mobile" : key;
            formikErrors[formikKey] = backendErrors[key][0];
            formikTouched[formikKey] = true;
          });
          setErrors(formikErrors);
          setTouched(formikTouched);
        } else {
          import("react-hot-toast").then(({ default: toast }) => {
            toast.error(
              axiosError?.response?.data?.message ||
                "Failed to update mobile number"
            );
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
      title={currentMobile ? "Change Mobile Number" : "Add Mobile Number"}
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
          label="New Mobile Number"
          name="mobile"
          type="number"
          value={formik.values.mobile}
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
          error={formik.touched.mobile ? formik.errors.mobile : undefined}
          className="bg-surface-elevated"
        />
      </div>
    </CommonPopup>
  );
};
