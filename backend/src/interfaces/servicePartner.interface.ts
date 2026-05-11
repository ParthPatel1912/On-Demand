import { BookingStatus } from "@/enums/transaction.enum";
import { Gender, Proficiency, ProfileUpdateType } from "../enums/servicePartner.enum";

export interface IPartnerEducation {
  id?: number;
  partnerId?: number;
  school: string;
  year: number;
  marks: number;
}

export interface IPartnerExperience {
  id?: number;
  partnerId?: number;
  company?: string;
  role?: string;
  from?: string;
  to?: string;
}

export interface IPartnerSkill {
  id?: number;
  partnerId?: number;
  categoryId: number;
}

export interface IPartnerService {
  id?: number;
  partnerId?: number;
  subCategoryId: number;
}

export interface IPartnerLanguage {
  id?: number;
  partnerId?: number;
  language: string;
  proficiency: Proficiency;
}

export interface IPartnerDocument {
  id?: number;
  partnerId?: number;
  documentUrl?: string;
  documentName?: string;
  cloudinaryId?: string;
  path?: string;
  originalname?: string;
  size?: string;
}

export interface IServicePartner {
  id?: number;
  userId: number;
  dob: string | Date;
  gender: Gender;
  mobile: string;
  applyingFor: number;
  permanentAddress?: string;
  residentialAddress?: string;
  profileImage?: string;
  cloudinaryId?: string;
}

export interface ServicePartnerQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  serviceTypeId?: number;
  status?: string;
  minJobs?: number;
  maxJobs?: number;
}

export interface AssignedBookingsQuery {
  page?: string | number;
  limit?: string | number;
  status?: BookingStatus;
  date?: string;
  time?: string;
}

export interface ProfileImageResponse {
  url: string | null;
  thumbnail: string | null;
  public_id: string | null;
}

export interface ServicePartnerProfileResponse {
  id: string | number;
  name: string;
  country_code: string;
  mobile_number: string;
  email: string;
  permanent_address: string;
  residential_address: string;
  role: string;
  profile_image: ProfileImageResponse;
}

export interface UpdateContactPayload {
  type: ProfileUpdateType.CONTACT;
  mobile: string;
  email: string;
  permanent_address: string;
  residential_address: string;
}

export interface UpdatePasswordPayload {
  type: ProfileUpdateType.PASSWORD;
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateImagePayload {
  type: ProfileUpdateType.IMAGE;
}

export type UpdateMyProfilePayload =
  | UpdateContactPayload
  | UpdatePasswordPayload
  | UpdateImagePayload;
