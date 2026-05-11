import { useState } from "react";
import { useFormik } from "formik";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import { AxiosError } from "axios";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  AdminUserFormValues,
  IAdminUser,
} from "@/types/user-management/admin.interface";
import { addSchema, editSchema } from "@/schemas";

interface IProps {
  open: boolean;
  setAddEditOpen: (open: boolean) => void;
  isEdit: boolean;
  selectedUser: IAdminUser | null;
  loading: boolean;
  onSave: (
    values: AdminUserFormValues,
    isEdit: boolean,
    userId?: string
  ) => Promise<void>;
  onCancel: () => void;
}

const AddEditAdminUserPopup = ({
  open,
  setAddEditOpen,
  isEdit,
  selectedUser,
  loading,
  onSave,
  onCancel,
}: IProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const formik = useFormik<AdminUserFormValues>({
    initialValues: {
      name: isEdit && selectedUser ? selectedUser?.name || "" : "",
      email: isEdit && selectedUser ? selectedUser?.email || "" : "",
      mobile: isEdit && selectedUser ? selectedUser?.mobile || "" : "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: isEdit ? editSchema : addSchema,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setErrors, setTouched }) => {
      try {
        await onSave(values, isEdit, selectedUser?.id);
      } catch (err: unknown) {
        console.error("Save user error:", err);
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
      }
    },
  });

  // useEffect(() => {
  //   if (isEdit && selectedUser) {
  //     formik.setValues({
  //       name: selectedUser.name,
  //       email: selectedUser.email,
  //       mobile: selectedUser.mobile,
  //       password: "",
  //       confirmPassword: "",
  //     });
  //   } else {
  //     formik.resetForm();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isEdit, selectedUser, open]);

  const handleCancel = () => {
    formik.resetForm();
    onCancel();
  };

  const isSaveEnabled = isEdit
    ? !loading && formik.dirty
    : !loading &&
      formik.values.name &&
      formik.values.email &&
      formik.values.mobile &&
      formik.values.password &&
      formik.values.confirmPassword;

  return (
    <CommonPopup
      className="w-100"
      open={open}
      onOpenChange={(val) => {
        if (!val) handleCancel();
        else setAddEditOpen(true);
      }}
      title={isEdit ? "Edit User" : "Add User"}
      loading={loading}
      footer={
        <div className="flex w-full gap-4">
          <Button variant="secondary" className="flex-1" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            className="flex-1"
            onClick={() => formik.handleSubmit()}
            disabled={!isSaveEnabled}
          >
            {loading ? "Loading..." : "Save"}
          </Button>
        </div>
      }
    >
      {/* Name */}
      <div>
        <FloatingLabelInput
          id="name"
          label="Name"
          name="name"
          value={formik.values.name}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("name", undefined);
          }}
          onBlur={formik.handleBlur}
          error={
            formik.touched.name ? (formik.errors.name as string) : undefined
          }
        />
      </div>

      <div>
        <FloatingLabelInput
          id="mobile"
          label="Mobile Number"
          name="mobile"
          value={formik.values.mobile}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("mobile", undefined);
          }}
          onBlur={formik.handleBlur}
          type="tel"
          maxLength={10}
          error={
            formik.touched.mobile ? (formik.errors.mobile as string) : undefined
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
          label="Email Address"
          name="email"
          value={formik.values.email}
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldError("email", undefined);
          }}
          onBlur={formik.handleBlur}
          type="email"
          error={
            formik.touched.email ? (formik.errors.email as string) : undefined
          }
          rightAddon={
            <button type="button">
              <Mail className="h-5 w-5" />
            </button>
          }
          className="pr-0"
          rightAddonClassName="bg-transparent text-ink-subtle"
        />
      </div>

      {!isEdit && (
        <>
          <div>
            <FloatingLabelInput
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              name="password"
              value={formik.values.password}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldError("password", undefined);
                if (formik.values.confirmPassword) {
                  formik.setFieldError("confirmPassword", undefined);
                }
              }}
              rightAddon={
                <button
                  type="button"
                  className="cursor-pointer hover:text-ink-mid"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5.5 w-5.5" />
                  ) : (
                    <Eye className="h-5.5 w-5.5" />
                  )}
                </button>
              }
              className="pr-0"
              rightAddonClassName="bg-transparent text-ink-subtle"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>
          <div>
            <FloatingLabelInput
              id="confirmPassword"
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
                    <EyeOff className="h-5.5 w-5.5" />
                  ) : (
                    <Eye className="h-5.5 w-5.5" />
                  )}
                </button>
              }
              className="pr-0"
              rightAddonClassName="bg-transparent text-ink-subtle"
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>
        </>
      )}
    </CommonPopup>
  );
};

export default AddEditAdminUserPopup;
