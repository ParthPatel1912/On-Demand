import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import axiosInstance from "@/helper/axiosInstance";
import type { Service } from "@/types/service.interface";
import { APP_ROUTES } from "@/routes/config";
import toast from "react-hot-toast";
import { OTHER_SERVICE_LIMIT, SERVICE_DETAILS_TEXT } from "@/constants/service.text";
import { Container } from "@/components/layout/Container";

const IconListItem = memo(
  ({ text, included = true }: { text: string; included?: boolean }) => (
    <li className="flex items-center gap-2 text-ink-muted">
      <div
        className={`${
          included ? "bg-emerald-600" : "bg-rose-500"
        } rounded-full p-0.75`}
      >
        {included ? (
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        ) : (
          <X className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        )}
      </div>
      <span className="text-sm sm:text-sm font-medium">{text}</span>
    </li>
  ),
);

const ServiceDetails = () => {
  const [service, setService] = useState<Service | null>(null);
  const [otherServices, setOtherServices] = useState<Service[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
  const [loadingOthers, setLoadingOthers] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const fetchServiceDetails = useCallback(async () => {
    if (!serviceId) {
      toast.error(SERVICE_DETAILS_TEXT.serviceIdIsUndefined);
      return;
    }
    try {
      setLoadingDetails(true);
      setDetailsError(null);
      const response = await axiosInstance.get(`services/${serviceId}`);
      if (response.data?.success && response.data?.data) {
        setService(response.data.data);
      } else {
        setService(null);
        setDetailsError(SERVICE_DETAILS_TEXT.noServiceFound);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err?.response?.status === 503) {
        setDetailsError(SERVICE_DETAILS_TEXT.serviceNotActive);
        navigate(APP_ROUTES.HOME);
      } else {
        setDetailsError(SERVICE_DETAILS_TEXT.somethingWentWrong);
      }
    } finally {
      setLoadingDetails(false);
    }
  }, [serviceId, navigate]);

  const fetchServices = useCallback(async () => {
    try {
      if (!service?.categoryId) {
        console.error(SERVICE_DETAILS_TEXT.categoryIdUndefined);
        return;
      }
      setLoadingOthers(true);
      const response = await axiosInstance.get(
        `categories/${service?.categoryId}/services`, 
        {
          params: {
            page: 1,
            limit: OTHER_SERVICE_LIMIT,
            subCategoryId: service?.subCategoryId ?? undefined,
            availability: true,
          },
        },
      );
      if (response.data.success) {
        const filteredServices = response.data.data.filter(
          (item: Service) => item.id !== service?.id
        );
        setOtherServices(filteredServices);
      }
    } catch (error: unknown) {
      console.error(SERVICE_DETAILS_TEXT.failedToFetchServices, error);
    } finally {
      setLoadingOthers(false);
    }
  }, [service?.categoryId, service?.subCategoryId, service?.id]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  useEffect(() => {
    if (service?.categoryId && service?.subCategoryId) fetchServices();
  }, [fetchServices, service?.categoryId, service?.subCategoryId]);

  const hasImages = useMemo(
    () => (service?.images?.length ?? 0) > 0,
    [service?.images],
  );
  const handleRedirectCheckout = (serviceId?: number) => {
    if (serviceId) {
      navigate(APP_ROUTES.CHECKOUT.replace(":serviceId", String(serviceId)), { state: { serviceId } });
    }
  };

  const handleViewAll = useCallback(() => {
    navigate(
      APP_ROUTES.SERVICE_LISTING.replace(":serviceTypeId", String(service?.serviceType.id)), {
      state: { subcategory: service?.subCategory },
    });
  }, [navigate, service?.serviceType?.id, service?.subCategory]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <Container className="mt-4 md:mt-8 max-w-300 px-4 md:px-0">
    <div className="container bg-white mx-auto py-8 md:py-12 min-h-[52vh]">
      {!loadingDetails && !service ? (
        <div className="flex flex-col items-center justify-center h-full min-h-75 gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-ink">
            {detailsError || SERVICE_DETAILS_TEXT.noServiceFound}
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBack}
            className="rounded-full px-5"
          >
            {SERVICE_DETAILS_TEXT.Back}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          <div
            className={`${
              otherServices.length > 0 ? "lg:col-span-3" : "lg:col-span-4"
            }`}
          >
            {loadingDetails && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 h-70 sm:h-80 md:h-85 animate-pulse">
                  <div className="col-span-1 sm:col-span-2 md:col-span-2 h-60 bg-surface-muted rounded-xl" />
                  <div className="hidden md:flex flex-col gap-4 col-span-1">
                    <div className="flex-1 h-28 bg-surface-muted rounded-xl" />
                    <div className="flex-1 h-28 bg-surface-muted rounded-xl" />
                  </div>
                  <div className="hidden md:flex flex-col gap-4 col-span-1">
                    <div className="flex-1 h-28 bg-surface-muted rounded-xl" />
                    <div className="flex-1 h-28 bg-surface-muted rounded-xl" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start sm:gap-4 mb-6 animate-pulse">
                  <div className="flex-1">
                    <div className="h-6 bg-surface-muted rounded w-2/3 mb-3" />
                    <div className="h-5 bg-surface-muted rounded w-1/3" />
                  </div>
                  <div className="h-11.25 w-26.25 rounded-full bg-surface-muted" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-5 animate-pulse">
                  <div>
                    <div className="h-5 bg-surface-muted rounded w-1/3 mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-surface-muted rounded" />
                      <div className="h-4 bg-surface-muted rounded w-5/6" />
                      <div className="h-4 bg-surface-muted rounded w-4/6" />
                      <div className="h-4 bg-surface-muted rounded w-2/3" />
                    </div>
                  </div>
                  <div>
                    <div className="h-5 bg-surface-muted rounded w-1/3 mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-surface-muted rounded" />
                      <div className="h-4 bg-surface-muted rounded w-5/6" />
                      <div className="h-4 bg-surface-muted rounded w-4/6" />
                      <div className="h-4 bg-surface-muted rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </>
            )}
            {!loadingDetails && service && hasImages && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                {/* Large Left Image */}
                <div className="col-span-2 md:col-span-2">
                  <img
                    src={service.images[0]}
                    alt="Service Main"
                    className="w-full h-full max-h-87.5 rounded-xl object-cover"
                  />
                </div>

                {/* Middle Column */}
                <div className="hidden md:flex flex-col gap-3 md:gap-4 col-span-2 md:col-span-1">
                  {service.images
                    .slice(1, 3)
                    .filter(Boolean)
                    .map((src, i) => (
                      <div key={`mid-${i}`} className="flex-1">
                        <img
                          src={src}
                          alt={`Service ${i + 2}`}
                          className="w-full h-full max-h-40.5 rounded-xl object-cover"
                        />
                      </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="hidden md:flex flex-col gap-3 md:gap-4 col-span-2 md:col-span-1">
                  {service.images
                    .slice(3, 5)
                    .filter(Boolean)
                    .map((src, i) => (
                      <div key={`right-${i}`} className="flex-1">
                        <img
                          src={src}
                          alt={`Service ${i + 4}`}
                          className="w-full h-full max-h-40.5 rounded-xl object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-row flex-wrap sm:justify-between sm:items-start sm:gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-[clamp(1.25rem,5vw,1.75rem)] break-all font-bold text-ink leading-tight">
                  {service?.name || SERVICE_DETAILS_TEXT.ServiceName}
                </h2>
                <p className="text-lg sm:text-xl font-bold text-ink mt-1 sm:mt-2">
                  ${service?.price || "0"}{" "}
                  {!!service?.duration && (
                    <span className="text-sm sm:text-lg text-ink-muted">
                      ({service?.duration} mins)
                    </span>
                  )}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => handleRedirectCheckout(service?.id)}
                className="rounded-full bg-primary hover:bg-primary-hover px-4 sm:px-6 text-white font-bold h-11.25 w-26.25 self-start sm:self-auto ml-auto -mt-2.5 sm:mt-0"
              >
                <Plus className="h-5 w-5 -mr-1" />
                {SERVICE_DETAILS_TEXT.Add}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-5">
              {service?.includeServices &&
                service.includeServices?.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-ink mb-3 sm:mb-4">
                      {service?.serviceType.name} {SERVICE_DETAILS_TEXT.Includes}
                    </h3>
                    <ul className="space-y-2 md:space-y-3">
                      {service?.includeServices.map((item) => (
                        <IconListItem key={item} text={item} />
                      ))}
                    </ul>
                  </div>
                )}
              {service?.excludeServices &&
                service?.excludeServices?.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-ink mb-3 sm:mb-4">
                      {service?.serviceType.name} {SERVICE_DETAILS_TEXT.Excludes}
                    </h3>
                    <ul className="space-y-2 md:space-y-3">
                      {service?.excludeServices.map((item) => (
                        <IconListItem key={item} text={item} included={false} />
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
          {otherServices.length > 0 && (
            <div className="lg:col-span-1 lg:max-w-[270px] lg:ml-auto space-y-4 sm:space-y-5 md:space-y-6 lg:max-w-75">
              <h2 className="text-[clamp(1.2rem,4vw,1.3rem)] text-ink font-bold">
                {SERVICE_DETAILS_TEXT.Other} {service?.subCategory.name} {SERVICE_DETAILS_TEXT.Services}
              </h2>
              {loadingOthers ? (
                <div className="space-y-6 animate-pulse">
                  {Array.from({ length: OTHER_SERVICE_LIMIT }).map((_, i) => (
                    <div key={i}>
                      <div className="flex justify-between gap-3">
                        <div className="flex-1 pr-2">
                          <div className="h-4 bg-surface-muted rounded w-4/5 mb-2" />
                          <div className="h-4 bg-surface-muted rounded w-2/5" />
                        </div>
                        <div className="relative shrink-0">
                          <div className="rounded-xl w-16 h-16 sm:w-20 sm:h-20 bg-surface-muted" />
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-surface-muted h-8 min-w-17.5" />
                        </div>
                      </div>
                      <Separator className="mt-4 sm:mt-5 md:mt-6 bg-line" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {otherServices.map((service, index) => (
                    <div key={service.id}>
                      <div className="flex justify-between gap-3">
                        <div className="flex-1 pr-2">
                          <h4 className="text-[clamp(0.875rem,3vw,0.9rem)] text-ink font-semibold line-clamp-2">
                            {service.name}
                          </h4>
                          <p className="text-[clamp(0.875rem,3vw,0.9rem)] font-bold text-ink mt-1">
                            ${service.price}
                          </p>
                        </div>
                        <div className="relative shrink-0">
                          {service.images?.[0] && (
                            <img
                              src={service.images[0]}
                              alt="Service Main"
                              className="w-22 h-22 max-h-22 max-width-22 rounded-xl object-cover"
                            />
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleRedirectCheckout(service.id)}
                            className="absolute -bottom-2 left-1/2 border -translate-x-1/2 rounded-full bg-white text-primary shadow-md hover:bg-gray-100 h-8 min-w-17.5 px-3 text-xs sm:text-sm"
                          >
                            <Plus className="h-4 w-4 -mr-1" />
                            {SERVICE_DETAILS_TEXT.Add}
                          </Button>
                        </div>
                      </div>
                      {index < otherServices.length && (
                        <Separator className="mt-4 sm:mt-5 md:mt-6 bg-line" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewAll}
                  className="w-auto min-w-25 px-6 py-2.5 h-10 text-sm font-bold rounded-full border-2 border-gray-300 text-primary hover:bg-primary/5 hover:text-primary mt-3"
                >
                  {SERVICE_DETAILS_TEXT.ViewAll}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </Container>
  );
};

export default ServiceDetails;
