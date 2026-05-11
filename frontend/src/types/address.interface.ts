/**
 * Type definitions for the AddressModal component.
 */

import type { ADDRESS_LABELS } from "@/utils/constants";

export type AddressLabel = (typeof ADDRESS_LABELS)[number]; // 'Home' | 'Office' | 'Other'

export interface MapCoords {
  latitude: number;
  longitude: number;
}

// ─── Nominatim API types ──────────────────────────────────────────────────────
export interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  [key: string]: string | undefined;
}
export interface NominatimSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}
export interface NominatimReverseResult {
  place_id: number;
  display_name: string;
  address: NominatimAddress;
}
export interface AddressFormValues {
  house: string;
  landmark: string;
  label: AddressLabel;
  extra: string;
}

export type AddressModalView = "list" | "search" | "map";
export interface BookingSuccessState {
  bookingId: string;
  bookingStatus: string;
  headerTitle: string;
  serviceName: string;
  serviceDuration: string;
  assignmentStatus: "ASSIGNING_SERVICE_PARTNER" | "SERVICE_PARTNER_ASSIGNED";
  servicePartner?: {
    name: string;
    phone: string;
    image: string | null;
    isVerified: boolean;
    serviceTypeName: string;
  };
  amountPaid: number;
  currency: string;
  invoiceNumber: string;
  invoiceDownloadUrl: string;
  selectedAddress: string;
  selectedDate: string;
  selectedTime: string;
  displayDateTime: string;
}

export interface BookingSuccessResponse {
  success: boolean;
  message: string;
  data: BookingSuccessState;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  invoiceUrl: string;
}

export interface DetailRowProps {
  label: string;
  value: string;
}
