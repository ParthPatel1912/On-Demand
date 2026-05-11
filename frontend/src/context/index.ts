export interface AdminDetailContextType {
  adminDetail: AdminDetail | null;
  setAdminDetail: React.Dispatch<React.SetStateAction<AdminDetail | null>>;
  loading: boolean;
  refetchAdminDetail: () => Promise<void>;
  partnerDetail: PartnerDetail | null;
  setPartnerDetail: React.Dispatch<React.SetStateAction<PartnerDetail | null>>;
  refetchPartnerDetail: () => Promise<void>;
}

export interface AdminDetail {
  id: number;
  name: string;
  email: string;
  country_code: string;
  mobile_number: string;
  mobile_number_with_country: string;
  address: string;
  role: string;
  is_super_admin: boolean;
  profile_image?: {
    url: string;
    thumbnail: string;
    public_id: string;
  };
}
export interface PartnerDetail {
  id: number;
  name: string;
  email: string;
  country_code: string;
  mobile_number: string;
  permanent_address: string;
  residential_address: string;
  role: string;
  profile_image?: {
    url: string;
    thumbnail: string;
    public_id: string;
  };
}
