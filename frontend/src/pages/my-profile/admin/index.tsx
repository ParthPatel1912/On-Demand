import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Pencil, Lock, Phone, Mail, MapPin, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

import { FloatingLabelInput } from "@/components/ui/input";
import { FloatingLabelTextarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/common/PageTitle";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CommonPopup from "@/components/common/CommonPopup";
import {
  contactEditSchema,
  profileImageSchema,
  updatePasswordSchema,
} from "@/schemas";
import { Label } from "@/components/ui/label";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { useAdminDetail } from "@/context/AdminDetailContext";
import { type IProfile } from "@/types/profile/admin.interface";
import { displayRole, getInitialsName } from "@/utils";
import { PROFILE_UPDATE_TYPE } from "@/utils/constants";

const MyProfile = () => {
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { adminDetail, setAdminDetail, refetchAdminDetail } = useAdminDetail();

  const contactFormik = useFormik({
    initialValues: {
      mobile_number: profile?.mobile_number || "",
      email: profile?.email || "",
      address: profile?.address || "",
    },
    enableReinitialize: true,
    validationSchema: contactEditSchema,
    validateOnChange: false,
    validateOnBlur: false,

    onSubmit: async (values, { setErrors, setTouched }) => {
      try {
        setLoading(true);

        const response = await axiosInstanceLaravel.put(
          "/admin/update-profile",
          {
            type: PROFILE_UPDATE_TYPE.CONTACT,
            mobile: values.mobile_number,
            email: values.email,
            address: values.address,
          }
        );
        if (response.data?.success) {
          toast.success(
            response.data?.message ||
              "Contact information updated successfully."
          );
          setAdminDetail((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              mobile_number: values.mobile_number,
              email: values.email,
              address: values.address,
            };
          });
          setShowEditModal(false);
        }
      } catch (err: unknown) {
        console.error(err);
        const axiosError = err as AxiosError<{ errors?: Record<string, string[]> }>;
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

  const passwordFormik = useFormik({
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

        const response = await axiosInstanceLaravel.put(
          "/admin/update-profile",
          {
            type: PROFILE_UPDATE_TYPE.PASSWORD,
            current_password: values.currentPassword,
            password: values.newPassword,
            password_confirmation: values.confirmPassword,
          }
        );
        if (response.data?.success) {
          toast.success(
            response.data?.message || "Password changed successfully."
          );
          resetForm();
          setShowPasswordModal(false);
        }
      } catch (err: unknown) {
        console.error("Error while change password:", err);
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
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await profileImageSchema.validate({ avatar: file });
      setAvatarError(null);

      await axiosInstanceLaravel.post(
        "/admin/update-profile",
        {
          _method: "PUT",
          type: PROFILE_UPDATE_TYPE.IMAGE,
          profile_image: file,
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      await refetchAdminDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAvatarError(err.message);
      }
    }
  };

  const handleEditPopup = () => {
    setShowEditModal(true);
    contactFormik.resetForm();
  };

  const handleOpenPasswordPopup = () => {
    setShowPasswordModal(true);
    passwordFormik.resetForm();
  };

  useEffect(() => {
    if (adminDetail) {
      const mappedData: IProfile = {
        name: adminDetail.name,
        role: displayRole(adminDetail.role),
        country_code: adminDetail.country_code,
        mobile_number: adminDetail.mobile_number,
        email: adminDetail.email,
        address: adminDetail.address,
        avatar: adminDetail.profile_image?.url,
      };

      setProfile(mappedData);
    }
  }, [adminDetail]);

  const isContactSaveEnabled = contactFormik.dirty && !loading;
  const isPasswordSaveEnabled =
    passwordFormik.values.currentPassword &&
    passwordFormik.values.newPassword &&
    passwordFormik.values.confirmPassword &&
    !loading;
  return (
    <>
      <PageTitle title=" My Profile" />
      <Card className="flex flex-col min-h-[calc(100vh-185px)] border-neutral-200 shadow-sm rounded-lg py-0 gap-0">
        <div className="h-[120px] w-full bg-gradient-to-r from-indigo-400 to-purple-400" />

        <div className="flex flex-col items-center -mt-14 pb-6 px-6">
          <div className="relative group w-[90px] h-[90px]">
            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden shadow-md bg-white flex items-center justify-center">
              {preview || profile?.avatar ? (
                <img
                  src={preview || profile?.avatar}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-primary ">
                  {getInitialsName(profile?.name)}
                </span>
              )}
            </div>

            <Label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition">
              <div className="bg-white p-2 rounded-full shadow-md transform scale-90 group-hover:scale-100 transition">
                <Pencil size={16} />
              </div>
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleAvatarChange}
              />
            </Label>
          </div>
          {avatarError && (
            <p className="text-xs text-red-500 mt-2">{avatarError}</p>
          )}
          <CardTitle className="text-base font-semibold text-neutral-800 ">
            {profile?.name}
          </CardTitle>
          <CardContent className="text-sm text-neutral-600">
            {profile?.role}
          </CardContent>
        </div>

        <div className="px-6 pb-6 space-y-4 w-full mx-auto sm:max-w-3xl">
          <div className="border border-line-strong rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <CardTitle className="text-base font-semibold text-neutral-800 ">
                Contact Information
              </CardTitle>
              <Button
                onClick={handleEditPopup}
                variant={"secondary"}
                className="sm:ml-4 mt-4 sm:mt-0"
              >
                <Pencil size={14} />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile?.mobile_number && (
                <div className="flex flex-col gap-1">
                  <Phone size={18} className="text-primary " />
                  <Label className="text-start wrap-break-word whitespace-normal">
                    {profile?.country_code && "+" + profile?.country_code}{" "}
                    {profile?.mobile_number}
                  </Label>
                </div>
              )}
              {profile?.email && (
                <div className="flex flex-col gap-1">
                  <Mail size={18} className="text-primary " />
                  <Label className="text-start wrap-break-word whitespace-normal">
                    {profile?.email}
                  </Label>
                </div>
              )}
              {profile?.address && (
                <div className="flex flex-col gap-1 ">
                  <MapPin size={18} className="text-primary " />
                  <Label className="text-start wrap-break-word whitespace-normal">
                    {profile?.address}
                  </Label>
                </div>
              )}
            </div>
          </div>

          <div className="border border-line-strong rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <CardTitle className="text-base font-semibold text-neutral-800 ">
                Security
              </CardTitle>
              <Button
                onClick={handleOpenPasswordPopup}
                variant={"secondary"}
                className="sm:ml-4 mt-4 sm:mt-0"
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Lock size={18} className="text-primary " />
              <span className="text-base tracking-[4px]">••••••••••••••</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ================= EDIT CONTACT MODAL ================= */}
      <CommonPopup
        className="w-100"
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title={"Edit Contact"}
        loading={loading}
        onCancel={() => setShowEditModal(false)}
        footer={
          <div className="flex w-full gap-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>

            <Button
              className="flex-1"
              onClick={() => contactFormik.handleSubmit()}
              disabled={!isContactSaveEnabled}
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
            value={contactFormik.values.mobile_number}
            onChange={(e) => {
              contactFormik.handleChange(e);
              contactFormik.setFieldError("mobile_number", undefined);
            }}
            rightAddon={
              <button type="button">
                <Phone className="h-[20px] w-[20px]" />
              </button>
            }
            className="pr-0"
            rightAddonClassName="bg-transparent text-ink-subtle"
          />
          {contactFormik.touched.mobile_number &&
            contactFormik.errors.mobile_number && (
              <p className="text-xs text-red-500 mt-1">
                {contactFormik.errors.mobile_number}
              </p>
            )}
        </div>
        <div>
          <FloatingLabelInput
            label="Email"
            name="email"
            value={contactFormik.values.email}
            onChange={(e) => {
              contactFormik.handleChange(e);
              contactFormik.setFieldError("email", undefined);
            }}
            rightAddon={
              <button type="button">
                <Mail className="h-[20px] w-[20px]" />
              </button>
            }
            className="pr-0"
            rightAddonClassName="bg-transparent text-ink-subtle"
          />
          {contactFormik.touched.email && contactFormik.errors.email && (
            <p className="text-xs text-red-500 mt-1">
              {contactFormik.errors.email}
            </p>
          )}
        </div>
        <div>
          <FloatingLabelTextarea
            label="Address"
            name="address"
            value={contactFormik.values.address}
            onChange={(e) => {
              contactFormik.handleChange(e);
              contactFormik.setFieldError("address", undefined);
            }}
          />
          {contactFormik.touched.address && contactFormik.errors.address && (
            <p className="text-xs text-red-500 mt-1">
              {contactFormik.errors.address}
            </p>
          )}
        </div>
      </CommonPopup>

      {/* ================= PASSWORD MODAL ================= */}
      <CommonPopup
        className="w-100"
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        title={"Change Password"}
        loading={loading}
        footer={
          <div className="flex w-full gap-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowPasswordModal(false)}
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
        <div>
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
                  <EyeOff className="h-[22px] w-[22px]" />
                ) : (
                  <Eye className="h-[22px] w-[22px]" />
                )}
              </button>
            }
            className="pr-0"
            rightAddonClassName="bg-transparent text-ink-subtle"
          />
          {passwordFormik.touched.currentPassword &&
            passwordFormik.errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">
                {passwordFormik.errors.currentPassword}
              </p>
            )}
        </div>
        <div>
          <FloatingLabelInput
            type={showNewPassword ? "text" : "password"}
            label="New Password"
            name="newPassword"
            value={passwordFormik.values.newPassword}
            onChange={(e) => {
              passwordFormik.handleChange(e);
              passwordFormik.setFieldError("newPassword", undefined);
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
          {passwordFormik.touched.newPassword &&
            passwordFormik.errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                {passwordFormik.errors.newPassword}
              </p>
            )}
        </div>
        <div>
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
                  <EyeOff className="h-[22px] w-[22px]" />
                ) : (
                  <Eye className="h-[22px] w-[22px]" />
                )}
              </button>
            }
            className="pr-0"
            rightAddonClassName="bg-transparent text-ink-subtle"
          />
          {passwordFormik.touched.confirmPassword &&
            passwordFormik.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {passwordFormik.errors.confirmPassword}
              </p>
            )}
        </div>
      </CommonPopup>
    </>
  );
};

export default MyProfile;
