import axiosInstance from "@/helper/axiosInstance";
import type {
  CreateOfferDto,
  GetOffersQueryDto,
  IResponse,
  OfferResponseDto,
  UpdateOfferDto,
} from "@/types/offers.interface";

/**
 * Fetch a list of offers with optional filtering and pagination.
 */
export const getOffers = async (params?: GetOffersQueryDto) => {
  const response = await axiosInstance.get("/offers", { params });
  return response;
};

/**
 * Fetch a single offer by ID.
 */
export const getOffer = async (offerId: number) => {
  const response = await axiosInstance.get<IResponse<OfferResponseDto>>(
    `/offers/${offerId}`,
  );
  return response.data;
};

/**
 * Create a new offer.
 */
export const createOffer = async (data: CreateOfferDto) => {
  const response = await axiosInstance.post<IResponse<OfferResponseDto>>(
    "/offers",
    data,
  );
  return response.data;
};

/**
 * Update an existing offer.
 */
export const updateOffer = async (offerId: number, data: UpdateOfferDto) => {
  const response = await axiosInstance.put<IResponse<OfferResponseDto>>(
    `/offers/${offerId}`,
    data,
  );
  return response.data;
};

/**
 * Update the used count for an offer.
 */
export const updateOfferUsedCount = async (offerId: number) => {
  const response = await axiosInstance.patch<IResponse<OfferResponseDto>>(
    `/offers/${offerId}/used-count`,
  );
  return response.data;
};

/**
 * Soft delete an offer.
 */
export const deleteOffer = async (offerId: number) => {
  const response = await axiosInstance.delete<IResponse<null>>(
    `/offers/${offerId}`,
  );
  return response.data;
};
