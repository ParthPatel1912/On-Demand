import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";

export interface Address {
  id: number | string;
  label: "Home" | "Office" | "Other";
  custom_label: string | null;
  display_label: string;
  house_flat_number: string;
  landmark: string;
  address: string;
  latitude: number;
  longitude: number;
  full_address: string;
}

export interface AddressRequest {
  label: "Home" | "Office" | "Other";
  custom_label?: string;
  house_flat_number: string;
  landmark: string;
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: Address[];
}

export const getAddresses = async (): Promise<AddressResponse> => {
  const response = await axiosInstanceLaravel.get("/customer/addresses");
  return response.data;
};

export const addAddress = async (data: AddressRequest): Promise<{ success: boolean; data: Address }> => {
  const response = await axiosInstanceLaravel.post("/customer/addresses", data);
  return response.data;
};

export const updateAddress = async (id: number | string, data: AddressRequest): Promise<{ success: boolean; data: Address }> => {
  const response = await axiosInstanceLaravel.put(`/customer/addresses/${id}`, data);
  return response.data;
};

export const deleteAddress = async (id: number | string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstanceLaravel.delete(`/customer/addresses/${id}`);
  return response.data;
};
