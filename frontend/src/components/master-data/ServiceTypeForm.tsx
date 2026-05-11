import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AxiosError } from "axios";

import { FloatingLabelInput } from "@/components/ui/input";
import CommonPopup from "@/components/common/CommonPopup";
import UploadIcon from "@/components/common/UploadIcon";
import { FullPageLoader } from "@/components/common/Loader";
import type { IServiceType } from "@/types/masterData.interface";
import { serviceTypeSchema } from "@/schemas";
import { SERVICE_TYPE_FORM_TEXT } from "@/constants/serviceTypeForm.text";

interface IProps {
  open: boolean;
  service: IServiceType | null;
  onClose: () => void;
  onSuccess: (
    values: { name: string; image: File | null; bannerImage: File | null },
    isEdit: boolean
  ) => Promise<void>;
}

const ServiceTypeForm = ({ open, service, onClose, onSuccess }: IProps) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!service;

  const formik = useFormik({
    initialValues: {
      name: service?.name || "",
      image: null as File | null,
      bannerImage: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: isEdit
      ? serviceTypeSchema.concat(
          Yup.object({
            bannerImage: Yup.mixed().nullable(),
          })
        )
      : serviceTypeSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { resetForm, setErrors, setTouched }) => {
      try {
        setLoading(true);
        await onSuccess(values, isEdit);
        resetForm();
        onClose();
      } catch (err: unknown) {
        console.error("Error while alter service type: ", err);
        const axiosError = err as AxiosError<{ errors?: Record<string, string[]> }>;
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

  const closeModal = () => {
    onClose();
    formik.resetForm();
  };

  return (
    <CommonPopup
      className="w-100"
      open={open}
      onOpenChange={(isOpen) => !isOpen && closeModal()}
      title={isEdit ? SERVICE_TYPE_FORM_TEXT.editTitle : SERVICE_TYPE_FORM_TEXT.addTitle}
      loading={loading}
      onSave={formik.handleSubmit}
    >
      <FullPageLoader isLoading={loading} />
      <div className="space-y-4">
        <div className="space-y-2">
          <UploadIcon
            label={SERVICE_TYPE_FORM_TEXT.uploadBannerLabel}
            displayPreviewOnTop
            className="w-full"
            previewClassName="w-full h-35 object-cover mb-1"
            value={formik.values.bannerImage}
            previewUrl={service?.bannerImage}
            onChange={(file) => {
              formik.setFieldValue("bannerImage", file);
              formik.setFieldError("bannerImage", undefined);
            }}
          />
          {formik.touched.bannerImage && formik.errors.bannerImage && (
            <p className="text-xs text-red-500 mt-1">
              {formik.errors.bannerImage as string}
            </p>
          )}
        </div>

        <FloatingLabelInput
          label={SERVICE_TYPE_FORM_TEXT.serviceTypeLabel}
          name="name"
          value={formik.values.name}
          error={
            formik.touched.name && formik.errors.name
              ? (formik.errors.name as string)
              : undefined
          }
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("name", undefined);
          }}
        />

        <div className="space-y-2">
          <UploadIcon
            value={formik.values.image}
            previewUrl={service?.image}
            onChange={(file) => {
              formik.setFieldValue("image", file);
              formik.setFieldError("image", undefined);
            }}
          />
          {formik.touched.image && formik.errors.image && (
            <p className="text-xs text-red-500 mt-1">
              {formik.errors.image as string}
            </p>
          )}
          <p className="text-xs text-neutral-500">
            {SERVICE_TYPE_FORM_TEXT.iconSizeHelperText}
          </p>
        </div>
      </div>
    </CommonPopup>
  );
};

export default ServiceTypeForm;
