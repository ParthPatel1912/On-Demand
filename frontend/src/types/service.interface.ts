import type { IServiceType } from "./masterData.interface";

export interface ServiceType {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  serviceTypeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface Service {
  id: number;
  name: string;
  categoryId: number;
  subCategoryId: number;
  price: string;
  duration: number | null;
  commission: string;
  availability: boolean;
  images: string[];
  cloudinaryIds: string[];
  includeServices: string[];
  excludeServices: string[];
  createdAt: string;
  updatedAt: string;
  subCategory: SubCategory;
  serviceType: ServiceType;
}

export interface IHomeServiceType {
  id: number;
  name: string;
  bookings: number;
  image: string | null;
  bannerImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface IProps {
  open: boolean;
  serviceType: IServiceType | null;
  setOpen: (open: boolean) => void;
  onHierarchyUpdated?: () => void;
}
export interface IServiceFormValues {
  id?: number;
  name: string;
  price: number | "";
  duration: string | number | "";
  subCategory: string;
  commission: number | "";
  availability: boolean;
  serviceIncludes: boolean;
  serviceExcludes: boolean;
  inclusionPointsList: string[];
  exclusionPointsList: string[];
  serviceImages: string[];
  categoryId?: string;
  serviceImagesIds: string[];
  deletedImages?: string[];
}

export interface SubCategoryEdit {
  id: string;
  name: string;
}

export interface ISubCateogyEditProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: Partial<IServiceFormValues>;
  isEdit?: boolean;
  onSave?: (values: IServiceFormValues) => void;
}

export interface IHomePublicStats {
  customersGlobally: number;
  servicesCount: number;
  servicesPartnerCount: number;
}