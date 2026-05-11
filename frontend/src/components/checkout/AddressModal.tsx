import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/input";
import { MapPin, Search, History, Crosshair, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  getAddresses,
  addAddress,
  updateAddress,
  type Address,
  type AddressRequest,
} from "@/api/customerAddress";
import toast from "react-hot-toast";

// Fix for default Leaflet marker icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Plus from "@/assets/checkout/Plus.png";
import CurrentLocation from "@/assets/checkout/GpsFix.png";

import type {
  AddressFormValues,
  AddressModalView,
  MapCoords,
  NominatimReverseResult,
  NominatimSearchResult,
} from "@/types/address.interface";

import {
  NOMINATIM_BASE_URL,
  NOMINATIM_HEADERS,
  NOMINATIM_SEARCH_LIMIT,
  MAP_REVERSE_GEOCODE_DEBOUNCE_MS,
  MAP_CENTER_THRESHOLD,
  DEFAULT_MAP_COORDS,
  SEARCH_DEBOUNCE_MS,
} from "@/utils/constants";
import {
  ADDRESS_MODAL_TEXT,
  ADDRESS_MODAL_STYLES,
} from "@/constants/checkout.text";
import { addressModalSchema } from "@/schemas";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapEvents = ({
  onMove,
}: {
  onMove: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onMove(center.lat, center.lng);
    },
  });
  return null;
};

const ChangeMapCenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    const current = map.getCenter();
    const diff =
      Math.abs(current.lat - center[0]) + Math.abs(current.lng - center[1]);

    if (diff > MAP_CENTER_THRESHOLD) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
  initialSelectedId?: string | number;
}

const AddressModal = ({
  isOpen,
  onClose,
  onSelect,
  initialSelectedId,
}: IProps) => {
  const [view, setView] = useState<AddressModalView>("list");
  const [selectedId, setSelectedId] = useState<string | number>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCoords, setMapCoords] = useState<MapCoords>(DEFAULT_MAP_COORDS);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formik = useFormik<AddressFormValues>({
    initialValues: { house: "", landmark: "", label: "Home", extra: "" },
    validationSchema: addressModalSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const payload: AddressRequest = {
          label: values.label,
          house_flat_number: values.house,
          landmark: values.landmark,
          address: searchQuery || "Manhattan, New York City, New York, USA",
          latitude: mapCoords.latitude,
          longitude: mapCoords.longitude,
          city: city,
          state: state,
          country: country,
          postcode: postcode,
        };

        if (values.label === "Other") payload.custom_label = values.extra;

        let response;
        if (editingAddress) {
          response = await updateAddress(editingAddress.id, payload);
          toast.success(ADDRESS_MODAL_TEXT.updateSuccess);
        } else {
          response = await addAddress(payload);
          toast.success(ADDRESS_MODAL_TEXT.addSuccess);
        }

        if (response.success) {
          onSelect(response.data);
          handleClose();
        }
      } catch (error) {
        console.error("Failed to save address:", error);
        toast.error(ADDRESS_MODAL_TEXT.saveFailed);
      }
    },
  });

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await getAddresses();
      if (response.success) {
        setSavedAddresses(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setView("list");
    setSelectedId("");
    setEditingAddress(null);
    setSearchQuery("");
    setPostcode("");
    setCity("");
    setState("");
    setCountry("");
    setSearchResults([]);
    setMapCoords(DEFAULT_MAP_COORDS);
    setIsDropdownOpen(false);
    formik.resetForm();
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetState, 300);
  };

  const handleSearchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    setIsDropdownOpen(true);

    try {
      const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
        query,
      )}&format=json&addressdetails=1&limit=${NOMINATIM_SEARCH_LIMIT}`;

      const response = await fetch(url, { headers: NOMINATIM_HEADERS });
      const data: NominatimSearchResult[] = await response.json();

      setSearchResults(data);
      if (data.length > 0) setIsDropdownOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      toast.error(ADDRESS_MODAL_TEXT.searchFailed);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: NominatimSearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setSearchQuery(result.display_name);
    formik.setFieldValue(
      "house",
      result.address.house_number || result.address.road || "",
    );
    formik.setFieldValue(
      "landmark",
      result.address.neighbourhood || result.address.suburb || "",
    );
    setMapCoords({ latitude: lat, longitude: lon });
    setPostcode(result.postcode || "");
    setCity(result.city || "");
    setState(result.state || "");
    setCountry(result.country || "");
    setSearchResults([]);
    setIsDropdownOpen(false);
    setView("map");
  };

  const handleMapMove = async (lat: number, lng: number) => {
    setMapCoords((prev) => ({ ...prev, latitude: lat, longitude: lng }));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const url = `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const response = await fetch(url, { headers: NOMINATIM_HEADERS });
        const data: NominatimReverseResult = await response.json();

        if (data?.display_name) {
          setSearchQuery(data.display_name);
          setPostcode(data.address.postcode || "");
          setCity(
            data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state_district ||
              "",
          );
          setState(data.address.state || "");
          setCountry(data.address.country || "");

          const houseNumber = data.address.house_number || "";
          const road = data.address.road || "";
          const landmark =
            data.address.neighbourhood || data.address.suburb || "";

          if (houseNumber) {
            formik.setFieldValue("house", `${houseNumber}, ${road}`);
          }
          if (landmark) {
            formik.setFieldValue("landmark", landmark);
          }
        }
      } catch (error) {
        console.error("Reverse geocoding error on move:", error);
      }
    }, MAP_REVERSE_GEOCODE_DEBOUNCE_MS);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(ADDRESS_MODAL_TEXT.gpsNotSupported);
      return;
    }

    const toastId = toast.loading(ADDRESS_MODAL_TEXT.fetchingLocation);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: NOMINATIM_HEADERS },
          );
          const data: NominatimReverseResult = await response.json();

          if (data?.display_name) {
            setSearchQuery(data.display_name);
            setPostcode(data.address.postcode || "");
            setCity(
              data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state_district ||
                "",
            );
            setState(data.address.state || "");
            setCountry(data.address.country || "");

            const houseNumber = data.address.house_number || "";
            const road = data.address.road || "";
            const landmark =
              data.address.neighbourhood || data.address.suburb || "";

            if (houseNumber) {
              formik.setFieldValue("house", `${houseNumber}, ${road}`);
            }
            if (landmark) {
              formik.setFieldValue("landmark", landmark);
            }

            setMapCoords({ latitude, longitude });
            toast.success(ADDRESS_MODAL_TEXT.locationFetched, { id: toastId });
            setView("map");
          } else {
            toast.error(ADDRESS_MODAL_TEXT.noAddressFound, { id: toastId });
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error(ADDRESS_MODAL_TEXT.locationFetchFailed, { id: toastId });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error(ADDRESS_MODAL_TEXT.gpsPermissionFailed, { id: toastId });
      },
      { enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      if (initialSelectedId) {
        setSelectedId(initialSelectedId);
      }
    }
  }, [isOpen, initialSelectedId]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (searchDebounceTimerRef.current)
        clearTimeout(searchDebounceTimerRef.current);
    };
  }, []);

  const renderStickyFooter = () => {
    if (view !== "map") return null;

    return (
      <div className={ADDRESS_MODAL_STYLES.footer}>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleClose}
            className={`${ADDRESS_MODAL_STYLES.outlineButton} w-full sm:w-auto`}
            type="button"
          >
            {ADDRESS_MODAL_TEXT.cancel}
          </button>

          <Button
            type="submit"
            form="address-form"
            disabled={formik.isSubmitting}
            className={`${ADDRESS_MODAL_STYLES.primaryButton} w-full sm:w-auto`}
          >
            {formik.isSubmitting
              ? ADDRESS_MODAL_TEXT.saving
              : ADDRESS_MODAL_TEXT.save}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className={ADDRESS_MODAL_STYLES.dialog}>
        {/* Sticky Header */}
        <div className={ADDRESS_MODAL_STYLES.header}>
          <div className="flex items-center justify-between gap-4">
            <h2 className={ADDRESS_MODAL_STYLES.sectionTitle}>
              {ADDRESS_MODAL_TEXT.title}
            </h2>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={20} className="text-ink-heading" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className={ADDRESS_MODAL_STYLES.body}>
          {view === "list" && (
            <div className="flex flex-col gap-4">
              <Button
                variant="link"
                className={ADDRESS_MODAL_STYLES.primaryLink}
                onClick={() => setView("search")}
              >
                <img src={Plus} alt="Add" className="w-4 h-4" />
                {ADDRESS_MODAL_TEXT.addNewAddress}
              </Button>

              <div>
                <h4 className="text-ink font-bold text-sm mb-4">
                  {ADDRESS_MODAL_TEXT.savedAddress}
                </h4>

                <div className="flex flex-col gap-4 max-h-120 overflow-y-auto pr-1 custom-scrollbar">
                  {isLoading ? (
                    <div className="text-sm text-gray-500 py-4 text-center">
                      {ADDRESS_MODAL_TEXT.loadingAddresses}
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-xl">
                      {ADDRESS_MODAL_TEXT.noSavedAddresses}
                    </div>
                  ) : (
                    savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`flex items-start gap-4 p-4 border-b transition-colors ${
                          selectedId === addr.id
                            ? "bg-primary/5"
                            : "border-line hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className="flex-1 flex items-center gap-4 cursor-pointer"
                          onClick={() => {
                            setSelectedId(addr.id);
                            setTimeout(() => onSelect(addr), 300);
                          }}
                        >
                          <div
                            className={`mt-0.5 w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selectedId === addr.id
                                ? "border-primary"
                                : "border-grey-200"
                            }`}
                          >
                            {selectedId === addr.id && (
                              <div className="w-3 h-3 bg-primary rounded-full" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="text-ink-heading font-semibold text-sm leading-5">
                              {addr.display_label}
                            </div>
                            <div className="text-ink-muted text-sm leading-5">
                              {addr.full_address}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "search" && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle"
                  size={18}
                />
                <input
                  autoFocus
                  placeholder={ADDRESS_MODAL_TEXT.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);

                    if (searchDebounceTimerRef.current) {
                      clearTimeout(searchDebounceTimerRef.current);
                    }
                    searchDebounceTimerRef.current = setTimeout(() => {
                      handleSearchLocation(value);
                    }, SEARCH_DEBOUNCE_MS);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      if (searchResults.length > 0) {
                        handleSelectSearchResult(searchResults[0]);
                      } else {
                        setView("map");
                        setIsDropdownOpen(false);
                      }
                    }
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  className="w-full h-12 pl-10 pr-4 rounded-[8px] border border-line focus:outline-none focus:border-primary bg-transparent text-sm"
                />

                {isDropdownOpen && searchResults.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 top-13 bg-white border border-line rounded-xl shadow-xl z-100 max-h-75 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                      {isSearching ? (
                        <div className="px-3 py-4 text-center text-ink-subtle text-[13px] flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Searching...
                        </div>
                      ) : (
                        searchResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-[8px] hover:bg-gray-50 cursor-pointer transition-colors group"
                            onClick={() => handleSelectSearchResult(result)}
                          >
                            <MapPin
                              className="mt-1 text-ink-subtle shrink-0 group-hover:text-primary"
                              size={16}
                            />
                            <div className="flex-1">
                              <div className="text-ink-heading font-medium text-sm leading-tight">
                                {result.display_name.split(",")[0]}
                              </div>
                              <div className="text-ink-subtle text-xs leading-tight line-clamp-2">
                                {result.display_name}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="link"
                className={ADDRESS_MODAL_STYLES.primaryLink}
                onClick={handleGetCurrentLocation}
              >
                <img
                  src={CurrentLocation}
                  alt="Current Location"
                  className="w-4 h-4"
                />
                {ADDRESS_MODAL_TEXT.useCurrentLocation}
              </Button>

              <div className="mt-2">
                <h4 className="text-ink-heading font-bold text-sm mb-4">
                  {ADDRESS_MODAL_TEXT.recentSearches}
                </h4>

                <div className="flex flex-col gap-4">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => {
                        setSearchQuery(addr.address);
                        setView("map");
                      }}
                    >
                      <History
                        className="mt-0.5 text-ink-subtle shrink-0"
                        size={18}
                      />
                      <div className="flex-1">
                        <div className="text-ink-heading font-medium text-sm leading-5">
                          {addr.address.split(",")[0]}
                        </div>
                        <div className="text-ink-subtle text-[13px] leading-5 line-clamp-1">
                          {addr.address}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "map" && (
            <div className="flex flex-col min-h-full">
              <div className="h-60! sm:h-70 w-full bg-grey-200 relative overflow-hidden rounded-2xl shadow-sm z-0 shrink-0">
                <MapContainer
                  center={[mapCoords.latitude, mapCoords.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[mapCoords.latitude, mapCoords.longitude]}
                    icon={DefaultIcon}
                  />
                  <MapEvents onMove={handleMapMove} />
                  <ChangeMapCenter
                    center={[mapCoords.latitude, mapCoords.longitude]}
                  />
                </MapContainer>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleGetCurrentLocation();
                  }}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-[8px] flex items-center justify-center shadow-lg text-primary hover:bg-gray-50 transition-colors z-1000"
                  title={ADDRESS_MODAL_TEXT.useCurrentLocation}
                >
                  <Crosshair size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-5 mt-6 pb-4">
                <div>
                  <h2 className="font-montserrat font-bold text-xs leading-4 tracking-[0.4px] text-ink-subtle mb-2">
                    {ADDRESS_MODAL_TEXT.selectedAddress}
                  </h2>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-alexandria font-semibold text-base leading-5.5 tracking-[0.0015em] text-ink-heading mb-1 wrap-break-word">
                        {formik.values.house || searchQuery.split(",")[0]}
                      </div>
                      <div className="font-alexandria font-normal text-sm leading-5 tracking-[0.0025em] text-ink-muted wrap-break-word">
                        {searchQuery}
                      </div>
                    </div>

                    <button
                      onClick={() => setView("search")}
                      className="px-6 py-2 rounded-full border border-line-input text-primary text-sm font-bold hover:bg-gray-50 transition-all shadow-sm shrink-0"
                      type="button"
                    >
                      {ADDRESS_MODAL_TEXT.change}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-line-subtle w-full" />

                <form
                  id="address-form"
                  onSubmit={formik.handleSubmit}
                  noValidate
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FloatingLabelInput
                        id="house"
                        label={ADDRESS_MODAL_TEXT.houseLabel}
                        value={formik.values.house}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.house && formik.errors.house
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      />
                      {formik.touched.house && formik.errors.house && (
                        <p className="text-red-500 text-xs mt-1 ml-1">
                          {formik.errors.house}
                        </p>
                      )}
                    </div>

                    <div>
                      <FloatingLabelInput
                        id="landmark"
                        label={ADDRESS_MODAL_TEXT.landmarkLabel}
                        value={formik.values.landmark}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.landmark && formik.errors.landmark
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }
                      />
                      {formik.touched.landmark && formik.errors.landmark && (
                        <p className="text-red-500 text-xs mt-1 ml-1">
                          {formik.errors.landmark}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-4">
                    <div className="font-alexandria font-bold text-sm leading-5 tracking-[0.001em] text-ink-heading">
                      {ADDRESS_MODAL_TEXT.saveAs}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => formik.setFieldValue("label", "Home")}
                        className={`px-8 py-2.5 rounded-full border text-sm font-medium transition-all ${
                          formik.values.label === "Home"
                            ? "bg-primary-soft border-primary text-primary"
                            : "border-line text-ink-muted hover:bg-gray-50"
                        }`}
                      >
                        {ADDRESS_MODAL_TEXT.home}
                      </button>

                      <button
                        type="button"
                        onClick={() => formik.setFieldValue("label", "Other")}
                        className={`px-8 py-2.5 rounded-full border text-sm font-medium transition-all ${
                          formik.values.label === "Other"
                            ? "bg-primary-soft border-primary text-primary"
                            : "border-line text-ink-muted hover:bg-gray-50"
                        }`}
                      >
                        {ADDRESS_MODAL_TEXT.other}
                      </button>
                    </div>

                    {formik.values.label === "Other" && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <FloatingLabelInput
                          id="extra"
                          label={ADDRESS_MODAL_TEXT.extraLabel}
                          value={formik.values.extra}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.extra && formik.errors.extra && (
                          <p className="text-red-500 text-xs mt-1 ml-1">
                            {formik.errors.extra}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        {renderStickyFooter()}
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
