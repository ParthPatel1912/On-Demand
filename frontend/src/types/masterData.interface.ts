import type { ROLES } from "@/enums/roles.enum";
import { type IPagination } from "./common.interface";

export interface IServiceType {
  id: number;
  name: string;
  image: string;
  bannerImage?: string;
  cloudinaryId: string;
  bannerCloudinaryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IActionMenu {
  onManage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export type ModalType = "add" | "edit" | "delete" | "manage" | null;

export type ServiceModalType =
  | "category"
  | "sub-category"
  | "category-edit"
  | "sub-category-edit"
  | "delete-category"
  | "delete-sub-category"
  | null;

export interface ServiceHierarchy {
  id: number;
  name: string;
  image: string;
  cloudinaryId: string;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  serviceTypeId: number;
  createdAt: string;
  updatedAt: string;
  subcategories: Subcategory[];
  servicesCount: number;
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface ServiceManagementList {
  success: boolean;
  data: ServiceManagement[];
  pagination: IPagination;
}

export interface ServiceManagement {
  id: number;
  name: string;
  categoryId: number;
  subCategoryId: number;
  price: string;
  duration: string | number;
  commission: string;
  availability: boolean;
  images: string[];
  cloudinaryIds: string[];
  includeServices: string[];
  excludeServices: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  creatorRole?: ROLES;
  creatorName?: string;
  subCategory?: Subcategory;
  serviceType?: IServiceDetailType;
}

export interface IServiceDetailType {
  id: number;
  name: string;
}

export interface IServiceDetailCategory {
  id: number;
  name: string;
  serviceTypeId: number;
  imageUrl: string | null;
  cloudinaryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IServiceDetailSubCategory {
  id: number;
  name: string;
  categoryId: number;
  imageUrl: string | null;
  cloudinaryId: string | null;
  createdAt: string;
  updatedAt: string;
  category: IServiceDetailCategory;
}

/** API response wrapper for GET /services/:id */
export interface IServiceDetailResponse {
  success: boolean;
  data: ServiceManagement;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAddress {
  id: number;
  label: string;
  custom_label: string | null;
  display_label: string;
  house_flat_number: string;
  landmark: string;
  address: string;
  latitude: number;
  longitude: number;
  full_address: string;
}

export interface ICustomerProfile {
  id: number;
  name: string;
  email: string;
  country_code: string | null;
  mobile_number: string | null;
  mobile_number_with_code: string;
  role: string;
  is_active: boolean;
  addresses: IAddress[];
}

export type ISubCategory = {
  id: number;
  name: string;
  image: File | string | null;
  imageUrl: string | null;
  cloudinaryId: string | null;
  isNew: boolean;
};

export type ICategory = {
  id: number;
  name: string;
  image: File | string | null;
  imageUrl: string | null;
  cloudinaryId: string | null;
  subCategories: ISubCategory[];
  isNew: boolean;
};

export type ICategoryRes = {
  id: number;
  name: string;
  image: File | string | null;
  imageUrl: string | null;
  cloudinaryId: string | null;
  subcategories: ISubCategory[];
  isNew: boolean;
};

export type ModalState = {
  type: ServiceModalType;
  data: ICategory | ISubCategory | null;
};

export type SubCategoryPayload = {
  id?: number;
  name: string;
  image: string | null;
};

export type CategoryPayload = {
  id?: number;
  name: string;
  image: string | null;
  subCategories: SubCategoryPayload[];
};
