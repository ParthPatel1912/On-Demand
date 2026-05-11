import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useFormik } from "formik";
import { Crosshair } from "lucide-react";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { addressSchema } from "@/schemas";
import { AddAddressSkeleton } from "./ProfileSkeleton";

export interface AddressPreFillData {
  houseNumber?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  addressline_1?: string;
  addressline_2?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface IProps {
  open: boolean;
  onClose: () => void;
  onChange: () => void;
  onSave: () => void;
  editId?: number;
  prefillData: AddressPreFillData;
}

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── Leaflet sub-components (must be defined outside the main component so hooks are valid) ──
const MapEvents = memo(
  ({ onMove }: { onMove: (lat: number, lng: number) => void }) => {
    useMapEvents({
      moveend: (e) => {
        const center = e.target.getCenter();
        onMove(center.lat, center.lng);
      },
    });
    return null;
  }
);

const ChangeMapCenter = memo(({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    const current = map.getCenter();
    const diff =
      Math.abs(current.lat - center[0]) + Math.abs(current.lng - center[1]);
    if (diff > 0.0001) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
});

export const AddAddressModal = ({
  open,
  onClose,
  onChange,
  onSave,
  editId,
  prefillData,
}: IProps) => {
  const [saveAs, setSaveAs] = useState<"Home" | "Other">("Home");
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Separate state for the map centre so user-drag updatess to formik lat/lon
  // don’t feed back into ChangeMapCenter and cause an infinite setView loop
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    prefillData.latitude,
    prefillData.longitude,
  ]);
  // markerPos: tracks the actual pin — updates on every drag + GPS/prefill
  const [markerPos, setMarkerPos] = useState<[number, number]>([
    prefillData.latitude,
    prefillData.longitude,
  ]);
  // Address display lines shown in the "Selected Address" card
  const [addressLine1, setAddressLine1] = useState<string>(
    prefillData.addressline_1 || prefillData.houseNumber || ""
  );
  const [addressLine2, setAddressLine2] = useState<string>(
    prefillData.addressline_2 || prefillData.landmark || ""
  );
  const [city, setCity] = useState<string>(prefillData.city || "");
  const [state, setState] = useState<string>(prefillData.state || "");
  const [country, setCountry] = useState<string>(prefillData.country || "");
  const [postcode, setPostcode] = useState<string>(prefillData.postcode || "");
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const formik = useFormik({
    initialValues: {
      houseNumber: "",
      landmark: "",
      saveAs: "Home",
      label: "",
      latitude: 0,
      longitude: 0,
    },
    validationSchema: addressSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          label: values.saveAs,
          custom_label: values.saveAs === "Other" ? values.label : "",
          house_flat_number: values.houseNumber,
          landmark: values.landmark,
          address: addressLine1 + ", " + addressLine2,
          latitude: values.latitude,
          longitude: values.longitude,
          city: city,
          state: state,
          country: country,
          postcode: postcode,
        };

        let response;

        if (editId) {
          response = await axiosInstanceLaravel.put(
            `customer/addresses/${editId}`,
            payload
          );
        } else {
          response = await axiosInstanceLaravel.post(
            "customer/addresses",
            payload
          );
        }

        if (response.data) {
          toast.success(
            editId
              ? "Address updated successfully"
              : "Address added successfully"
          );
          onSave();
          onClose();
          formik.resetForm();
        }
      } catch (error) {
        console.error("Add address error:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setSaveAs("Home");
      return;
    }

    // Pre-fill from Geoapify / GPS selection
    if (prefillData && !editId) {
      formik.setValues({
        houseNumber: prefillData.houseNumber || "",
        landmark: prefillData.landmark || "",
        saveAs: "Home",
        label: "",
        latitude: prefillData.latitude ?? 0,
        longitude: prefillData.longitude ?? 0,
      });
      // Also move the map AND marker to the new location
      if (prefillData.latitude !== 0 || prefillData.longitude !== 0) {
        setMapCenter([prefillData.latitude, prefillData.longitude]);
        setMarkerPos([prefillData.latitude, prefillData.longitude]);
      }
      // Seed address display lines from Geoapify data
      setAddressLine1(
        prefillData.addressline_1 || prefillData.houseNumber || ""
      );
      setAddressLine2(prefillData.addressline_2 || prefillData.landmark || "");
      setCity(prefillData.city || "");
      setState(prefillData.state || "");
      setCountry(prefillData.country || "");
      setPostcode(prefillData.postcode || "");
      return;
    }

    if (editId) {
      const fetchAddress = async () => {
        setIsLoadingFetch(true);
        try {
          const response = await axiosInstanceLaravel.get(
            `customer/addresses/${editId}`
          );
          const data = response.data?.data;
          if (data) {
            formik.setValues({
              houseNumber: data.house_flat_number || "",
              landmark: data.landmark || "",
              saveAs: data.label === "Other" ? "Other" : "Home",
              label: data.custom_label || "",
              latitude: data.latitude ?? 0,
              longitude: data.longitude ?? 0,
            });
            const parts = ((data.address as string) || "").split(",");
            const line1 = parts[0]?.trim() || "";
            const line2 = parts.slice(1).join(",").trim();
            setAddressLine1(line1);
            setAddressLine2(line2);
            setCity(data.city || "");
            setState(data.state || "");
            setPostcode(data.postcode || "");
            setCountry(data.country || "");
            setSaveAs(data.label === "Other" ? "Other" : "Home");
            if (data.latitude && data.longitude) {
              setMapCenter([data.latitude, data.longitude]);
              setMarkerPos([data.latitude, data.longitude]);
            }
          }
        } catch (error) {
          console.error("Fetch address error:", error);
          toast.error("Failed to load address details");
          onClose();
        } finally {
          setIsLoadingFetch(false);
        }
      };
      fetchAddress();
    }
  }, [open, editId, prefillData]);

  const handleSaveAsChange = (type: "Home" | "Other") => {
    setSaveAs(type);
    formik.setFieldValue("saveAs", type);
    if (type === "Home") {
      formik.setFieldValue("label", "");
      formik.setFieldTouched("label", false);
    }
  };

  const handleMapMove = useCallback(
    async (lat: number, lng: number) => {
      // Update formik and the marker position on every drag; do NOT touch mapCenter
      // (mapCenter feeds ChangeMapCenter — updating it on drag causes an infinite loop)
      formik.setFieldValue("latitude", lat);
      formik.setFieldValue("longitude", lng);
      setMarkerPos([lat, lng]);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
              headers: {
                "User-Agent": "Antigravity-Checkout-Address-App",
                "Accept-Language": "en",
              },
            }
          );
          const data = await response.json();

          if (data && data.display_name) {
            const parts = (data.display_name as string).split(",");
            const line1 = parts[0]?.trim() || "";
            const line2 = parts.slice(1).join(",").trim();
            setAddressLine1(line1);
            setAddressLine2(line2);

            const houseNumber = data.address.house_number || "";
            const road = data.address.road || "";
            const landmark =
              data.address.neighbourhood || data.address.suburb || "";
            const country = data.address.country || "";
            const state = data.address.state || "";
            const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "";
            const postcode = data.address.postcode || "";
            
            setCountry(country);
            setState(state);
            setCity(city);
            setPostcode(postcode);

            if (houseNumber) {
              formik.setFieldValue("houseNumber", `${houseNumber}, ${road}`);
            }
            if (landmark) {
              formik.setFieldValue("landmark", landmark);
            }
          }
        } catch (error) {
          console.error("Reverse geocoding error on move:", error);
        }
      }, 500);
    },
    [formik.setFieldValue]
  );

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const toastId = toast.loading("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        formik.setFieldValue("latitude", latitude);
        formik.setFieldValue("longitude", longitude);
        setMapCenter([latitude, longitude]); // move map to GPS location
        setMarkerPos([latitude, longitude]); // move marker to GPS location

        toast.success("Location fetched successfully!", { id: toastId });
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
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={editId ? "Edit Address" : "Add Address"}
      className="max-w-[550px]"
      inset={false}
      onSave={formik.handleSubmit}
      saveText={editId ? "Update" : "Add"}
      variant="small"
      loading={isLoadingFetch || formik.isSubmitting}
    >
      <div className="flex flex-col relative">
        {isLoadingFetch ? (
          <AddAddressSkeleton />
        ) : (
          <div className="flex flex-col">
            {/* Map Section */}
            <div className="px-6 pb-2">
              <div className="h-55 w-full bg-white relative overflow-hidden rounded-2xl border border-line shadow-sm z-0">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={markerPos} icon={DefaultIcon} />
                  <MapEvents onMove={handleMapMove} />
                  <ChangeMapCenter center={mapCenter} />
                </MapContainer>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleGetCurrentLocation();
                  }}
                  className="absolute bottom-4 right-4 w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-[0px_8px_16px_rgba(0,0,0,0.1)] text-primary hover:bg-gray-50 border border-line transition-all active:scale-95 z-1000"
                  title="Use current location"
                >
                  <Crosshair className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Address Details Section */}
            <div className="px-6 py-6 space-y-8">
              {/* Selected Address Display */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="font-alexandria font-bold text-xxs text-ink-subtle uppercase tracking-[0.05em]">
                    SELECTED ADDRESS
                  </span>
                  <h3 className="font-alexandria font-bold text-base text-ink leading-snug">
                    {addressLine1 || "Select Location"}
                  </h3>
                  <p className="font-alexandria font-medium text-[13px] text-ink-muted leading-relaxed">
                    {addressLine2 || "Drag the pin or use current location"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onChange && onChange();
                  }}
                  className="rounded-full border border-line text-primary font-bold text-[13px] h-10 px-6 hover:bg-gray-50 transition-all whitespace-nowrap"
                >
                  Change
                </button>
              </div>

              <div className="w-full h-px bg-line" />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FloatingLabelInput
                    label="House/Flat Number*"
                    name="houseNumber"
                    value={formik.values.houseNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="bg-surface-elevated"
                  />
                  {formik.touched.houseNumber && formik.errors.houseNumber && (
                    <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">
                      {formik.errors.houseNumber as string}
                    </p>
                  )}
                </div>
                <div>
                  <FloatingLabelInput
                    label="Landmark*"
                    name="landmark"
                    value={formik.values.landmark}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="bg-surface-elevated"
                  />
                  {formik.touched.landmark && formik.errors.landmark && (
                    <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">
                      {formik.errors.landmark as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Save As Selection */}
              <div className="space-y-4">
                <span className="font-alexandria font-bold text-xxs text-ink-subtle uppercase tracking-[0.05em] block">
                  Save As
                </span>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleSaveAsChange("Home")}
                    className={cn(
                      "px-10 py-2.5 rounded-full border-2 font-bold text-sm transition-all",
                      saveAs === "Home"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-line text-ink-muted bg-transparent hover:border-ink-muted/30"
                    )}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAsChange("Other")}
                    className={cn(
                      "px-10 py-2.5 rounded-full border-2 font-bold text-sm transition-all",
                      saveAs === "Other"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-line text-ink-muted bg-transparent hover:border-ink-muted/30"
                    )}
                  >
                    Other
                  </button>
                </div>
              </div>

              {saveAs === "Other" && (
                <div className="animate-in fade-in slide-in-from-top-3 duration-300">
                  <FloatingLabelInput
                    label="Label"
                    name="label"
                    placeholder="Eg. John's home, Mom's place, etc."
                    value={formik.values.label}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="bg-surface-elevated"
                  />
                  {formik.touched.label && formik.errors.label && (
                    <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">
                      {formik.errors.label as string}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CommonPopup>
  );
};
