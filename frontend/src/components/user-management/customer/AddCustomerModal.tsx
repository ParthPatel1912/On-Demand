import React from "react";
import { useFormik } from "formik";
import { Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import axiosInstance from "@/helper/axiosInstance";
import { addCustomerSchema } from "@/schemas";
import type { AddCustomerFormValues, IAddCustomerProps } from "@/types/common.interface";


const AddCustomerModal = ({ open, onClose, onSuccess }: IAddCustomerProps) => {
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik<AddCustomerFormValues>({
    initialValues: {
      name: "",
      mobileNumber: "",
      email: "",
    },
    validationSchema: addCustomerSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setErrors, setTouched }) => {
      try {
        setLoading(true);
        const formData = new FormData();
        if (values.name) formData.append("name", values.name?.trim());
        if (values.email) formData.append("email", values.email?.trim());
        if (values.mobileNumber)
          formData.append(
            "mobileNumber",
            values.mobileNumber?.toString().trim()
          );
        const response = await axiosInstance.post(
          "admin-customers/add-customer",
          formData
        );

        if (response.data?.success) {
          toast.success("Customer added successfully");
          onSuccess();
          handleClose();
        } else {
          toast.error(response.data?.message || "Failed to add customer");
        }
      } catch (error: unknown) {
        console.error("Error adding customer:", error);
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
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const modalFooter = (
    <div className="flex items-center gap-3 w-full">
      <Button
        variant="ghost"
        onClick={handleClose}
        className="flex-1 h-12 rounded-xl bg-primary/5 text-primary font-bold hover:bg-primary/10"
      >
        Cancel
      </Button>
      <Button
        onClick={() => formik.handleSubmit()}
        disabled={loading}
        className="flex-1 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover"
      >
        {loading ? "Loading..." : "Save"}
      </Button>
    </div>
  );

  return (
    <CommonPopup
      open={open}
      onOpenChange={handleClose}
      title="Add Customer"
      loading={loading}
      footer={modalFooter}
      className="sm:max-w-100 w-full"
    >
      <div className="space-y-5 pt-2">
        <div>
          <FloatingLabelInput
            id="name"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldError("name", undefined);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.name ? formik.errors.name : undefined}
          />
        </div>
        <div>
          <FloatingLabelInput
            id="mobileNumber"
            name="mobileNumber"
            label="Mobile Number"
            type="number"
            value={formik.values.mobileNumber}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldError("mobileNumber", undefined);
            }}
            onBlur={formik.handleBlur}
            error={
              formik.touched.mobileNumber
                ? formik.errors.mobileNumber
                : undefined
            }
            rightAddon={
              <button type="button">
                <Phone className="h-5 w-5" />
              </button>
            }
            className="pr-0"
            rightAddonClassName="bg-transparent text-ink-subtle"
          />
        </div>
        <div>
          <FloatingLabelInput
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formik.values.email}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldError("email", undefined);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : undefined}
            rightAddon={
              <button type="button">
                <Mail className="h-5 w-5" />
              </button>
            }
            className="pr-0"
            rightAddonClassName="bg-transparent text-ink-subtle"
          />
        </div>
      </div>
    </CommonPopup>
  );
};

export default AddCustomerModal;
