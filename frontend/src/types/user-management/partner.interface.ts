import {
  SERVICE_PARTNERS_ADMIN_ACTION,
  SERVICE_PARTNER_SERVICE_STATUS,
  SERVICE_PARTNER_STATUS,
  SERVICE_PARTNER_VERIFICATION_STATUS,
} from "@/utils/constants";

export type ServicePartnerStatus =
  (typeof SERVICE_PARTNER_STATUS)[keyof typeof SERVICE_PARTNER_STATUS];

export type ServicePartnerServiceStatus =
  (typeof SERVICE_PARTNER_SERVICE_STATUS)[keyof typeof SERVICE_PARTNER_SERVICE_STATUS];

export type ServicePartnerVerificationStatus =
  (typeof SERVICE_PARTNER_VERIFICATION_STATUS)[keyof typeof SERVICE_PARTNER_VERIFICATION_STATUS];

export type ServicePartnersAdminAction =
  (typeof SERVICE_PARTNERS_ADMIN_ACTION)[keyof typeof SERVICE_PARTNERS_ADMIN_ACTION];

export interface IUser {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  profileImage: string | null;
  isActive: boolean;
}

export interface IServiceTypeSummary {
  id: number;
  name: string;
}

export interface IEducation {
  id: number;
  partnerId: number;
  schoolCollege: string;
  passingYear: number;
  marks: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExperience {
  id: number;
  partnerId: number;
  companyName: string;
  role: string;
  from: string;
  to: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILanguage {
  id: number;
  partnerId: number;
  language: string;
  proficiency: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPartnerDocument {
  id: number;
  partnerId: number;
  documentUrl: string;
  documentName: string;
  cloudinaryId: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISkill {
  id: number;
  partnerId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
}

export interface IService {
  id: number;
  partnerId: number;
  subCategoryId: number;
  createdAt: string;
  updatedAt: string;
  subCategory: {
    id: number;
    name: string;
  };
}

export interface IServicePartner {
  id: number;
  userId: number;
  dob: string;
  gender: string;
  serviceTypeIds: number[];
  permanentAddress: string | null;
  residentialAddress: string | null;
  verificationStatus: ServicePartnerVerificationStatus;
  status: string;
  displayedStatus: string;
  createdAt: string;
  updatedAt: string;
  jobsCompleted?: string;
  user: IUser;
  serviceTypes: IServiceTypeSummary[];
}

export interface IPartnerDetail extends IServicePartner {
  educations: IEducation[];
  experiences: IExperience[];
  skills: ISkill[];
  services: IService[];
  languages: ILanguage[];
  documents: IPartnerDocument[];
}

export type ModalType = "delete" | "status" | null;

export type FilterState = {
  serviceTypeId: string;
  minJobs: number;
  maxJobs: number;
  status: string;
};

export interface IAssignedService {
  id: number;
  bookingDate: string;
  serviceAddress: string;
  status: string;
  service: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
  };
}

export type AssignedServiceFilterState = {
  date: string | undefined;
  time: string;
  status: string;
};
