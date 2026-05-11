import { History, LocateFixed, Search } from "lucide-react";
import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import toast from "react-hot-toast";

import type { AddressPreFillData } from "@/components/profile/AddAddressModal";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import CommonPopup from "@/components/common/CommonPopup";
import { UI_COLORS } from "@/constants/colors";

// Type for the place result returned by Geoapify
interface GeoapifyPlace {
  properties: {
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lon?: number;
    postcode?: string;
    [key: string]: unknown;
  };
}

interface RecentSearch {
  id: number;
  latitude: string;
  longitude: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

interface IProps {
  open: boolean;
  onClose: () => void;
  onPlaceSelect: (data: AddressPreFillData) => void;
  recentSearches?: RecentSearch[];
}

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY as string;

export const LocationPickerModal = ({
  open,
  onClose,
  onPlaceSelect,
  recentSearches = [],
}: IProps) => {
  const handlePlaceSelect = (place: GeoapifyPlace) => {
    const p = place.properties;
    const data: AddressPreFillData = {
      houseNumber: "",
      landmark: p.address_line2 ?? "",
      latitude: p.lat ?? 0,
      longitude: p.lon ?? 0,
      addressline_1: p.address_line1 ?? "",
      addressline_2: p.address_line2 ?? "",
      postcode: p.postcode ?? "",
      city: p.city ?? "",
      state: p.state ?? "",
      country: p.country ?? "",
    };

    // Fire-and-forget: save this place as a recent search
    axiosInstanceLaravel
      .post("customer/recent-searches", {
        latitude: String(p.lat ?? 0),
        longitude: String(p.lon ?? 0),
        address_line1: p.address_line1 ?? "",
        address_line2: p.address_line2 ?? "",
        city: p.city ?? "",
        state: p.state ?? "",
        country: p.country ?? "",
        postcode: p.postcode ?? "",
      })
      .catch((err) => {
        console.error("Failed to save recent search:", err);
      });

    onPlaceSelect(data);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const toastId = toast.loading("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "Antigravity-Checkout-Address-App",
                "Accept-Language": "en",
              },
            }
          );
          const nominatim = await response.json();

          const parts = (nominatim.display_name as string).split(",");
          const line1 = parts[0]?.trim() || "";
          const line2 = parts.slice(1).join(",").trim();

          const addr = nominatim?.address ?? {};
          const houseNumber = addr.house_number || line1 || "";
          const road = addr.road || "";
          const landmark = addr.neighbourhood || line2 || addr.suburb || "";
          const city = addr.city || addr.town || addr.village || addr.state_district || "";
          const state = addr.state || "";
          const country = addr.country || "";
          const postcode = addr.postcode || "";

          const data: AddressPreFillData = {
            houseNumber: houseNumber ? `${houseNumber}, ${road}` : road,
            landmark,
            latitude,
            longitude,
            addressline_1: houseNumber ? `${houseNumber}, ${road}` : road,
            addressline_2: landmark,
            postcode,
            city,
            state,
            country,
          };

          toast.success("Location fetched successfully!", { id: toastId });
          onPlaceSelect(data);
          onClose();
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error("Failed to fetch address details.", { id: toastId });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error(
          "Failed to get your GPS location. Please check permissions.",
          { id: toastId }
        );
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <CommonPopup
      open={open}
      hideFooter={true}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Add Address"
      className="max-w-125"
    >
      <div className="flex flex-col gap-6">
        {/* Geoapify Search Input */}
        <div className="relative geoapify-search-wrapper [&_.geoapify-autocomplete-input]:pl-12 [&_.geoapify-autocomplete-input]:h-12 [&_.geoapify-autocomplete-input]:rounded-xl [&_.geoapify-autocomplete-input]:border-line [&_.geoapify-autocomplete-input]:font-alexandria [&_.geoapify-autocomplete-input]:text-sm [&_.geoapify-autocomplete-input]:w-full [&_.geoapify-autocomplete-input]:bg-white [&_.geoapify-autocomplete-input]:focus:border-primary [&_.geoapify-autocomplete-input]:focus:ring-0 [&_.geoapify-autocomplete-input]:transition-all">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
            <GeoapifyGeocoderAutocomplete
              placeholder="Search your location"
              placeSelect={handlePlaceSelect}
              debounceDelay={300}
              skipIcons={true}
            />
          </GeoapifyContext>
        </div>

        {/* Use Current Location Action */}
        <button
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-3 text-primary font-bold font-alexandria text-sm hover:opacity-80 transition-opacity w-fit"
        >
          <LocateFixed className="w-5 h-5" />
          Use current location
        </button>

        {/* Recent Searches Section */}
        {recentSearches.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-alexandria font-bold text-base text-ink">
              Recent Searches
            </h3>
            <div className="flex flex-col">
              {recentSearches.map((search, index) => (
                <button
                  key={search.id}
                  onClick={() => {
                    onPlaceSelect({
                      houseNumber: "",
                      landmark: search.address_line2,
                      latitude: parseFloat(search.latitude),
                      longitude: parseFloat(search.longitude),
                      addressline_1: search.address_line1,
                      addressline_2: search.address_line2,
                      postcode: search.postcode,
                      city: search.city,
                      state: search.state,
                      country: search.country,
                    });
                    onClose();
                  }}
                  className={cn(
                    "flex items-start gap-4 py-4 text-left hover:bg-gray-50 transition-colors w-full cursor-pointer",
                    index !== 0 && "border-t border-line"
                  )}
                >
                  <div className="mt-1">
                    <History className="w-5 h-5 text-ink-muted" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-alexandria font-bold text-sm text-ink">
                      {search.address_line1}
                    </span>
                    <span className="font-alexandria font-medium text-xs text-ink-muted">
                      {search.address_line2},{" "}
                      {search.postcode ? search.postcode + "," : ""}{" "}
                      {search.city ? search.city + "," : ""}{" "}
                      {search.state ? search.state + "," : ""}{" "}
                      {search.country ? search.country + "," : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom overrides to match the design system */}
      <style>{`
        .geoapify-search-wrapper .geoapify-geocoder-autocomplete-container {
          width: 100%;
        }

        .geoapify-search-wrapper .geoapify-autocomplete-input {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 40px 14px 48px;
          border-radius: 12px;
          border: 1px solid ${UI_COLORS.line};
          background: ${UI_COLORS.white};
          font-family: 'Alexandria', sans-serif;
          font-size: 14px;
          color: ${UI_COLORS.ink};
          line-height: 1.4;
          height: auto;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .geoapify-search-wrapper .geoapify-autocomplete-input:focus {
          border-color: ${UI_COLORS.primary};
        }

        .geoapify-search-wrapper .geoapify-autocomplete-input::placeholder {
          color: ${UI_COLORS.inkMuted};
        }

        .geoapify-search-wrapper .geoapify-input-wrapper {
          position: relative;
          width: 100%;
        }

        .geoapify-search-wrapper .geoapify-autocomplete-items {
          border: 1px solid ${UI_COLORS.line};
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          z-index: 100;
        }

        .geoapify-search-wrapper .geoapify-autocomplete-items div {
          font-family: 'Alexandria', sans-serif;
          font-size: 14px;
          color: ${UI_COLORS.ink};
          padding: 10px 14px;
        }

        .geoapify-search-wrapper .geoapify-autocomplete-items div:hover,
        .geoapify-search-wrapper .geoapify-autocomplete-items .active {
          background-color: ${UI_COLORS.geoapifyHover};
        }

        .geoapify-search-wrapper .geoapify-autocomplete-items .secondary-part {
          color: ${UI_COLORS.inkMuted};
          font-size: 12px;
        }

        .geoapify-search-wrapper .geoapify-close-button {
          color: ${UI_COLORS.inkMuted};
        }

        .geoapify-search-wrapper .geoapify-close-button:hover {
          color: ${UI_COLORS.ink};
        }
      `}</style>
    </CommonPopup>
  );
};

// Helper function for conditional classes if not imported
function cn(...classes: unknown[]) {
  return (classes as (string | boolean | undefined | null)[])
    .filter(Boolean)
    .join(" ");
}
