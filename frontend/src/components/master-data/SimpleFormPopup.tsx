import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { FloatingLabelInput } from "@/components/ui/input";
import CommonPopup from "@/components/common/CommonPopup";
import UploadIcon from "@/components/common/UploadIcon";

interface IProps {
  open: boolean;
  title: string;
  label: string;
  onClose: () => void;
  onSubmit: (values: { name: string; image: File | null; imageRemoved: boolean }) => Promise<void>;
  schema: Yup.AnyObjectSchema;
  isUpload?: boolean;
  initialValues?: { name: string; image: File | string | null };
}

const SimpleFormPopup = ({
  open,
  title,
  label,
  onClose,
  onSubmit,
  schema,
  isUpload = false,
  initialValues,
}: IProps) => {
  const [loading, setLoading] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || "",
      image: (typeof initialValues?.image === "string"
        ? initialValues.image
        : initialValues?.image) as File | string | null,
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (
      values: {
        name: string;
        image: File | string | null;
      },
      { resetForm },
    ) => {
      try {
        setLoading(true);
        // values.image might be string or File
        const imageFile = typeof values.image === "string" ? null : values.image;
        await onSubmit({ ...values, image: imageFile, imageRemoved });
        resetForm();
        setImageRemoved(false);
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <CommonPopup
      className="w-100"
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setImageRemoved(false);
          onClose();
        }
      }}
      title={title}
      loading={loading}
      onSave={formik.handleSubmit}
    >
      <div>
        <FloatingLabelInput
          label={label}
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-xs text-red-500 mt-1">
            {formik.errors.name as string}
          </p>
        )}
        <div className="space-y-2 mt-6">
          {isUpload && (
            <>
              <UploadIcon
                value={typeof formik.values.image === "string" ? null : formik.values.image}
                previewUrl={
                  imageRemoved
                    ? null
                    : typeof formik.values.image === "string"
                      ? formik.values.image
                      : null
                }
                onChange={(file) => {
                  formik.setFieldValue("image", file);
                  setImageRemoved(false);
                }}
                onRemove={() => {
                  formik.setFieldValue("image", null);
                  setImageRemoved(true);
                }}
                label="Upload Image *"
              />
              {formik.touched.image && formik.errors.image && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.image as string}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </CommonPopup>
  );
};

export default SimpleFormPopup;
