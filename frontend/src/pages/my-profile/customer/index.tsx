import { useState, useEffect } from "react";

import { ContactInfo } from "@/components/profile/ContactInfo";
import { SavedAddresses } from "@/components/profile/SavedAddresses";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import type { ICustomerProfile } from "@/types/masterData.interface";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { PROFILE_TEXT } from "@/constants/profile.text";

const MyProfile = () => {
  const [profileData, setProfileData] = useState<ICustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await axiosInstanceLaravel.get("customer/profile");
      if (response.data && response.data.data) {
        setProfileData(response.data.data);
      }
    } catch (error: unknown) {
      console.error(PROFILE_TEXT.fetchProfileError, error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex flex-col bg-white font-alexandria">
      <main className="grow container mx-auto px-4 py-12 max-w-300">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-bold text-ink">{PROFILE_TEXT.title}</h1>
          </div>

          <div className="flex flex-col gap-8">
            <ContactInfo
              email={profileData?.email}
              mobileNumberWithCode={profileData?.mobile_number_with_code}
              onProfileUpdate={() => fetchProfile(false)}
            />
            <SavedAddresses initialAddresses={profileData?.addresses || []} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;
