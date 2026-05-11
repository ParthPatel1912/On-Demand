export interface ICoupon {
  id: number;
  coupon_code: string;
  coupon_description: string;
  discount_percentage: number;
  discount_percentage_text: string;
  times_applied: number;
  times_applied_text: string;
  is_active: boolean;
  status_label: string;
  created_at: string;
  max_usage: number;
}

export interface IFilterParams {
  discount?: number;
  min_applied?: number;
  max_applied?: number;
  availability?: boolean;
}

export interface IResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    last_page: number;
  };
}

export interface OfferAttributes {
  id: number;
  couponCode: string;
  couponDescription?: string | null;
  discountPercentage: number;
  maxUsage?: number;
  usedCount?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateOfferDto {
  coupon_code: string;
  coupon_description?: string | null;
  discount_percentage: number;
  max_usage: number;
  used_count?: number;
  is_active?: boolean;
}

export interface UpdateOfferDto {
  coupon_code?: string;
  coupon_description?: string | null;
  discount_percentage?: number;
  max_usage?: number;
  used_count?: number;
  isActive?: boolean;
}

export interface UpdateOfferUsedCountDto {
  usedCount: number;
}

export type TSortOrder = "ASC" | "DESC";

export interface GetOffersQueryDto {
  is_active?: boolean;
  is_applicable?: boolean;
  page?: number;
  per_page?: number;
  discount?: number;
  min_discount?: number;
  max_discount?: number;
  min_applied?: number;
  max_applied?: number;
  min_usage_limit?: number;
  max_usage_limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: TSortOrder;
  created_from?: Date;
  created_to?: Date;
}

export interface OfferResponseDto {
  id: number;
  couponCode: string;
  couponDescription: string | null;
  discountPercentage: number;
  maxUsage: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  isDeleted?: boolean;
}
