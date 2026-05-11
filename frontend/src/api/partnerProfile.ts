import axiosInstance from "@/helper/axiosInstance";
import type {
  UpdateContactPayload,
  UpdatePasswordPayload,
} from "@/types/profile/partner.interface";
import { PROFILE_UPDATE_TYPE } from "@/utils/constants";

export const getPartnerProfile = () =>
  axiosInstance.get("/service-partner/profile");

export const updateContact = (payload: UpdateContactPayload) =>
  axiosInstance.put("/service-partner/update-profile", {
    type: PROFILE_UPDATE_TYPE.CONTACT,
    mobile: payload.mobile,
    email: payload.email,
    permanent_address: payload.permanent_address,
    residential_address: payload.residential_address,
  });

export const updatePassword = (payload: UpdatePasswordPayload) =>
  axiosInstance.put("/service-partner/update-profile", {
    type: PROFILE_UPDATE_TYPE.PASSWORD,
    current_password: payload.current_password,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
  });

export const updateProfileImage = (file: File) => {
  const formData = new FormData();
  formData.append("type", PROFILE_UPDATE_TYPE.IMAGE);
  formData.append("profile_image", file);

  return axiosInstance.put("/service-partner/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
