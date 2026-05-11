import React, { useEffect, useState } from "react";
import { Pencil, Lock, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/common/PageTitle";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { profileImageSchema } from "@/schemas";
import { displayRole, getInitialsName } from "@/utils";
import { updateProfileImage } from "@/api/partnerProfile";
import ContactInfoModal from "@/components/profile/partner/ContactInfoModal";
import UpdatePasswordModal from "@/components/profile/partner/UpdatePasswordModal";
import type { IPartnerProfile } from "@/types/profile/partner.interface";
import { useAdminDetail } from "@/context/AdminDetailContext";

const MyProfile = () => {
  const [profile, setProfile] = useState<IPartnerProfile | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { partnerDetail, setPartnerDetail, refetchPartnerDetail } =
    useAdminDetail();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await profileImageSchema.validate({ avatar: file });
      setAvatarError(null);
      await updateProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      await refetchPartnerDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAvatarError(err.message);
      }
    }
  };

  const handleContactSuccess = (values: {
    mobile_number: string;
    email: string;
    permanent_address: string;
    residential_address: string;
  }) => {
    setPartnerDetail((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        mobile_number: values.mobile_number,
        email: values.email,
        permanent_address: values.permanent_address,
        residential_address: values.residential_address,
      };
    });
  };

  useEffect(() => {
    if (partnerDetail) {
      const mappedData: IPartnerProfile = {
        name: partnerDetail.name,
        role: displayRole(partnerDetail.role),
        country_code: partnerDetail.country_code,
        mobile_number: partnerDetail.mobile_number,
        email: partnerDetail.email,
        permanent_address: partnerDetail.permanent_address,
        residential_address: partnerDetail.residential_address,
        avatar: partnerDetail.profile_image?.url,
      };

      setProfile(mappedData);
    }
  }, [partnerDetail]);

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
                onClick={() => setShowEditModal(true)}
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
              {profile?.permanent_address && (
                <div className="flex flex-col gap-1 ">
                  <MapPin size={18} className="text-primary " />
                  <Label className="text-start wrap-break-word whitespace-normal">
                    {profile?.permanent_address}
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
                onClick={() => setShowPasswordModal(true)}
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
      <ContactInfoModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialValues={{
          mobile_number: profile?.mobile_number || "",
          email: profile?.email || "",
          permanent_address: profile?.permanent_address || "",
          residential_address: profile?.residential_address || "",
        }}
        onSuccess={handleContactSuccess}
      />

      {/* ================= PASSWORD MODAL ================= */}
      <UpdatePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default MyProfile;
