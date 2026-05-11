import type { USER_MANAGEMENT_STATUS_OPTIONS } from "@/utils/constants";
import { type ISortProps } from "../common.interface";

export interface IAdminUser {
  id: string;
  name: string;
  profileImage: string | null;
  email: string;
  countryCode: string | null;
  mobile: string;
  address: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}


export interface AdminUserFilterParams extends ISortProps {
  status?: (typeof USER_MANAGEMENT_STATUS_OPTIONS)[keyof typeof USER_MANAGEMENT_STATUS_OPTIONS];
  role?: "admin" | "superadmin";
}

export interface AdminUserFilterValues {
  search: string;
  status: (typeof USER_MANAGEMENT_STATUS_OPTIONS)[keyof typeof USER_MANAGEMENT_STATUS_OPTIONS];
}

export interface AdminUserFormValues {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}
