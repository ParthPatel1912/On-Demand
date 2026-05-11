import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Search, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ServiceCategoriesSidebar,
  type ISubcategory,
} from "@/components/services/listing/ServiceCategoriesSidebar";
import {
  ServiceCard,
  type IService,
} from "@/components/services/listing/ServiceCard";
import serviceTypeListingImage from "@/assets/images/service-type-listing.svg";
import axiosInstance from "@/helper/axiosInstance";
import type { IServiceTypeListing } from "@/types/serviceListing.inteface";
import { SERVICE_LISTING_TEXT } from "@/constants/serviceListing.text";
import { PAGINATION_DEFAULT_LIMIT } from "@/utils/constants";

const ServiceListingPage = () => {
  const { serviceTypeId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, onSubCategorySelected] =
    useState<ISubcategory | null>(null);
  const [serviceTypeData, setServiceTypeData] = useState<IServiceTypeListing | null>(null);
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const LOAD_MORE_SKELETON_COUNT = 2;
  const [hasSearched, setHasSearched] = useState(false);
  const [totalServices, setTotalServices] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const lastFetchParams = useRef<{
    searchQuery: string;
    subCategoryId: string | null;
    serviceTypeId: string | undefined;
  } | null>(null);

  const fetchServices = async (offset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setServicesLoading(true);
      }

      const params = new URLSearchParams({
        offset: String(offset),
        limit: PAGINATION_DEFAULT_LIMIT.toString(),
      });

      if (searchedQuery) {
        params.append("q", searchedQuery);
      }

      if (selectedSubCategory) {
        params.append("subCategoryId", selectedSubCategory.id);
      }
      const response = await axiosInstance.get(
        `/service-types/${serviceTypeId}/services?${params}`,
      );

      const newServices: IService[] = response.data.data || [];
      setServices((prev) => (append ? [...prev, ...newServices] : newServices));
      setTotalServices(response.data.pagination?.totalItems || 0);
      setHasMore(response.data.hasMore || false);
      setNextOffset(response.data.nextOffset ?? offset + newServices.length);

    } catch (error: unknown) {
      console.error(SERVICE_LISTING_TEXT.failedToFetchServices, error);
      if (!append) setServices([]);
    } finally {
      setServicesLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchServiceType = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/service-types/${serviceTypeId}`,
        );
        setServiceTypeData(response.data.data);
      } catch (error: unknown) {
        console.error(SERVICE_LISTING_TEXT.failedToFetchServiceType, error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceTypeId) {
      fetchServiceType();
    }
  }, [serviceTypeId]);

  useEffect(() => {
    if (serviceTypeId && !isSidebarLoading) {
      const currentParams = {
        searchQuery: searchedQuery || "",
        subCategoryId: selectedSubCategory?.id || null,
        serviceTypeId,
      };

      if (
        !lastFetchParams.current ||
        currentParams.searchQuery !== lastFetchParams.current.searchQuery ||
        currentParams.subCategoryId !== lastFetchParams.current.subCategoryId ||
        currentParams.serviceTypeId !== lastFetchParams.current.serviceTypeId
      ) {
        lastFetchParams.current = currentParams;
        fetchServices(0, false);
      }
    }
  }, [serviceTypeId, selectedSubCategory?.id, searchedQuery, isSidebarLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchedQuery?.trim() !== searchQuery.trim()) {
      setHasSearched(true);
      setSearchedQuery(searchQuery);
      onSubCategorySelected(null);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-300 mx-auto px-4">
      {/* Hero Section */}
      <div
        className="relative h-100 md:h-100 container mx-auto mt-12 px-4 md:px-8 py-6 flex flex-col justify-end items-start text-white rounded-3xl bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            serviceTypeData?.bannerImage || serviceTypeListingImage
          })`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-black/64 rounded-3xl" />

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="absolute top-1/3 md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xs lg:max-w-lg md:max-w-md flex items-center rounded-full p-2 border-2 backdrop-blur-[30px]"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.32)",
            borderColor: "rgba(255, 255, 255, 0.32)",
            boxShadow:
              "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 text-white h-5 w-5" />
            <Input
              type="text"
              placeholder={`${SERVICE_LISTING_TEXT.searchPlaceholderPrefix}${serviceTypeData?.name || ""}${SERVICE_LISTING_TEXT.searchPlaceholderSuffix}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-transparent text-white placeholder-white! border-none focus:ring-0 focus:outline-none w-full font-montserrat font-medium text-base md:text-lg leading-6 tracking-[0.15%]"
            />
          </div>
          <Button
            type="submit"
            className="rounded-full py-2 md:py-4 px-4 md:px-6 text-sm md:text-base"
          >
            {SERVICE_LISTING_TEXT.searchBtn}
          </Button>
        </form>

        <div className="flex flex-col gap-3 z-1 w-full mt-20 md:mt-0">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 bg-white/20" />
              <Skeleton className="h-8 md:h-12 w-48 md:w-64 bg-white/20" />
            </div>
          ) : (
            <>
              <p className="font-montserrat font-semibold text-sm md:text-base leading-5 md:leading-5.5 tracking-[0.15%] text-white">
                {serviceTypeData?.totalServices || "0"}{SERVICE_LISTING_TEXT.plusServices}
              </p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
                <h1 className="font-bold text-3xl max-w-auto md:max-w-175 sm:max-w-75 md:text-[48px] leading-10 md:leading-15 tracking-normal mb-2 truncate">
                  {serviceTypeData?.name || SERVICE_LISTING_TEXT.servicesFallback}
                </h1>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                  <span className="font-montserrat font-semibold text-[14px] leading-5 tracking-[0.1%] text-white flex items-center gap-2">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center">
                      <Check className="w-2 h-2 md:w-3 md:h-3 text-white" />
                    </div>
                    {SERVICE_LISTING_TEXT.verifiedProfessionals}
                  </span>
                  <span className="font-montserrat font-semibold text-xs md:text-sm leading-4.5 md:leading-5 tracking-[0.1%] text-white flex items-center gap-2">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center">
                      <Check className="w-2 h-2 md:w-3 md:h-3 text-white" />
                    </div>
                    {SERVICE_LISTING_TEXT.superiorStainRemoval}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Badges */}
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6 py-10 items-start">
        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0 sticky md:sticky md:top-6">
          <ServiceCategoriesSidebar
            selectedSubCategory={selectedSubCategory}
            onSubCategorySelected={onSubCategorySelected}
            serviceTypeId={serviceTypeId || ""}
            onLoadingComplete={() => setIsSidebarLoading(false)}
          />
        </div>

        {/* Service Listings */}
        <div className="flex-1 md:border-l md:border-l-line md:pl-6 pt-1 min-h-150">
          <div className="mb-6">
            {(hasSearched && searchedQuery) || !selectedSubCategory?.name ? (
              <>
                {searchedQuery ? (
                  <h2 className="text-xl md:text-2xl leading-7 md:leading-8 tracking-normal text-ink">
                    {SERVICE_LISTING_TEXT.searchResultsFor}{" "}
                    <span className="font-bold">"{searchedQuery}"</span>
                  </h2>
                ) : (
                  <h2 className="font-bold text-xl md:text-2xl leading-7 md:leading-8 tracking-normal text-ink">
                    {SERVICE_LISTING_TEXT.allServices}
                  </h2>
                )}
                <p className="font-medium text-sm leading-5 tracking-[0.1%] text-ink-muted">
                  {totalServices || 0}{SERVICE_LISTING_TEXT.servicesCount}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-bold text-[24px] leading-8 tracking-normal text-ink">
                  {selectedSubCategory?.name}
                </h2>
                <p className="font-medium text-sm leading-5 tracking-[0.1%] text-ink-muted">
                  {selectedSubCategory?.serviceCount || 0}{SERVICE_LISTING_TEXT.servicesCount}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-10">
            {servicesLoading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-24 h-24 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{SERVICE_LISTING_TEXT.noServicesFound}</p>
              </div>
            ) : (
              services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            )}

            {/* Load More Skeletons */}
            {loadingMore && (
              <div className="space-y-6">
                {Array.from({ length: LOAD_MORE_SKELETON_COUNT }).map((_, i) => (
                  <div key={`lm-skel-${i}`} className="bg-white rounded-lg p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-24 h-24 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            {/* Load More Button */}
            {hasMore && !servicesLoading && !loadingMore && (
              <div className="flex justify-center pt-10">
                <Button
                  onClick={() => fetchServices(nextOffset, true)}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-2 text-primary font-bold text-xs md:text-sm py-1 md:py-2 px-3 md:px-4"
                >
                  Load More
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ServiceListingPage;
