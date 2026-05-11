import type { PROFILE_UPDATE_TYPE } from "@/utils/constants";

export interface IProfile {
  name: string;
  role: string;
  country_code: string;
  mobile_number: string;
  email: string;
  address: string;
  avatar?: string;
}

export type ProfileUpdateType =
  (typeof PROFILE_UPDATE_TYPE)[keyof typeof PROFILE_UPDATE_TYPE];
