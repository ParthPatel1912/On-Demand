import { useState } from "react";
import { useFormik } from "formik";
import { Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import { FloatingLabelTextarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateContact } from "@/api/partnerProfile";

interface Props {
  open: boolean;
  onClose: () => void;
  initialValues: {
    mobile_number: string;
    email: string;
    permanent_address: string;
    residential_address: string;
  };
  onSuccess: (values: {
    mobile_number: string;
    email: string;
    permanent_address: string;
    residential_address: string;
  }) => void;
}

const ContactInfoModal = ({
  open,
  onClose,
  initialValues,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      mobile_number: initialValues.mobile_number || "",
      email: initialValues.email || "",
      permanent_address: initialValues.permanent_address || "",
      residential_address: initialValues.residential_address || "",
    },
    enableReinitialize: true,
    // validationSchema: servicePartnerContactEditSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setErrors, setTouched }) => {
      try {
        setLoading(true);
        const response = await updateContact({
          mobile: values.mobile_number,
          email: values.email,
          permanent_address: values.permanent_address,
          residential_address: values.residential_address,
        });
        if (response.data?.success) {
          toast.success(
            response.data?.message ||
              "Contact information updated successfully."
          );
          onSuccess({
            mobile_number: values.mobile_number,
            email: values.email,
            permanent_address: values.permanent_address,
            residential_address: values.residential_address,
          });
          onClose();
        }
      } catch (err: unknown) {
        console.error(err);
        const axiosError = err as AxiosError<{
          errors?: Record<string, string[]>;
        }>;
        if (axiosError.response?.data?.errors) {
          const backendErrors = axiosError.response.data.errors;
          const map: Record<string, string> = { mobile: "mobile_number" };
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
    onClose();
  };

  return (
    <CommonPopup
      className="w-100"
      open={open}
      onOpenChange={handleClose}
      title="Edit Contact"
      loading={loading}
      onCancel={handleClose}
      footer={
        <div className="flex w-full gap-4">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => formik.handleSubmit()}
            disabled={!formik.dirty || loading}
          >
            {loading ? "Loading..." : "Save"}
          </Button>
        </div>
      }
    >
      <div>
        <FloatingLabelInput
          label="Mobile Number"
          name="mobile_number"
          value={formik.values.mobile_number}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("mobile_number", undefined);
          }}
          rightAddon={
            <button type="button">
              <Phone className="h-[20px] w-[20px]" />
            </button>
          }
          className="pr-0"
          rightAddonClassName="bg-transparent text-ink-subtle"
        />
        {formik.touched.mobile_number && formik.errors.mobile_number && (
          <p className="text-xs text-red-500 mt-1">
            {formik.errors.mobile_number}
          </p>
        )}
      </div>
      <div>
        <FloatingLabelInput
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("email", undefined);
          }}
          rightAddon={
            <button type="button">
              <Mail className="h-[20px] w-[20px]" />
            </button>
          }
          className="pr-0"
          rightAddonClassName="bg-transparent text-ink-subtle"
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
        )}
      </div>
      <div>
        <FloatingLabelTextarea
          label="Permanent Address"
          name="permanent_address"
          value={formik.values.permanent_address}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("permanent_address", undefined);
          }}
        />
        {formik.touched.permanent_address &&
          formik.errors.permanent_address && (
            <p className="text-xs text-red-500 mt-1">
              {formik.errors.permanent_address}
            </p>
          )}
      </div>
      <div>
        <FloatingLabelTextarea
          label="Residential Address"
          name="residential_address"
          value={formik.values.residential_address}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("residential_address", undefined);
          }}
        />
        {formik.touched.residential_address &&
          formik.errors.residential_address && (
            <p className="text-xs text-red-500 mt-1">
              {formik.errors.residential_address}
            </p>
          )}
      </div>
    </CommonPopup>
  );
};

export default ContactInfoModal;
