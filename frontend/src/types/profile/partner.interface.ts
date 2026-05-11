import type { PROFILE_UPDATE_TYPE } from "@/utils/constants";

export interface UpdateContactPayload {
  mobile: string;
  email: string;
  permanent_address: string;
  residential_address: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface IPartnerProfile {
  name: string;
  role: string;
  country_code: string;
  mobile_number: string;
  email: string;
  permanent_address: string;
  residential_address: string;
  avatar?: string;
}

export type ProfileUpdateType =
  (typeof PROFILE_UPDATE_TYPE)[keyof typeof PROFILE_UPDATE_TYPE];
