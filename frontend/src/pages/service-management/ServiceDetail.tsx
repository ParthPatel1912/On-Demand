import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "@/helper/axiosInstance";
import { APP_ROUTES } from "@/routes/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddEditService } from "@/components/service-management/AddEditService";
import type {
  ServiceManagement,
  IServiceDetailResponse,
} from "@/types/masterData.interface";
import { SERVICE_MANAGEMENT_TEXT } from "@/constants/serviceManagement.text";
import { useAuth } from "@/hooks/useAuth";

const ServiceDetail = () => {
  const { user, isPartner, isAdmin } = useAuth();
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const fetchServiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<IServiceDetailResponse>(
        `/services/admin/${serviceId}`,
      );
      if (res.data.success) {
        setService(res.data.data);
      }
    } catch (err: unknown) {
      console.error(SERVICE_MANAGEMENT_TEXT.failedToFetchDetails, err);
      toast.error(SERVICE_MANAGEMENT_TEXT.failedToLoadDetails);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-lg font-semibold text-neutral-600">
          {SERVICE_MANAGEMENT_TEXT.serviceNotFound}
        </p>
        <Button onClick={() => isPartner ? navigate(APP_ROUTES.SERVICE_PARTNER_SERVICE_MANAGEMENT) : navigate(APP_ROUTES.ADMIN_SERVICE_MANAGEMENT)}>
          {SERVICE_MANAGEMENT_TEXT.goBack}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0 rounded-full hover:bg-neutral-100"
          >
            <ArrowLeft className="h-6 w-6 text-ink-muted" />
          </Button>

          <h1 className="text-[22px] font-bold text-ink truncate font-alexandria">
            {service.name}
          </h1>
        </div>

        {(isAdmin || service?.createdBy === (user as any)?.id) && (
          <Button
            onClick={() => setOpenEditDialog(true)}
            className="bg-primary hover:bg-primary-hover gap-2 px-6 rounded-lg text-white text-[14px] leading-5 font-bold"
          >
            <Pencil className="h-4 w-4" strokeWidth={3} />
            {SERVICE_MANAGEMENT_TEXT.editBtn}
          </Button>
        )}
      </div>

      <Card className="border-none shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] bg-white">
        <CardContent className="p-8 space-y-10">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
            <DetailItem label={SERVICE_MANAGEMENT_TEXT.serviceName} value={service.name} />
            <DetailItem
              label={SERVICE_MANAGEMENT_TEXT.serviceType}
              value={service.serviceType?.name ?? "—"}
            />
            <DetailItem
              label={SERVICE_MANAGEMENT_TEXT.serviceCategory}
              value={service.subCategory?.category?.name ?? "—"}
            />
            <DetailItem
              label={SERVICE_MANAGEMENT_TEXT.serviceSubCategory}
              value={service.subCategory?.name ?? "—"}
            />
            <DetailItem label={SERVICE_MANAGEMENT_TEXT.durationLabel.replace("*", "")} value={`${service.duration}${SERVICE_MANAGEMENT_TEXT.durationAddon}`} />
            <DetailItem
              label={SERVICE_MANAGEMENT_TEXT.priceLabel.replace("*", "")}
              value={`${SERVICE_MANAGEMENT_TEXT.priceAddon}${parseFloat(service.price).toFixed(2)}`}
            />
            <DetailItem
              label={SERVICE_MANAGEMENT_TEXT.tableAvailability}
              value={service.availability ? SERVICE_MANAGEMENT_TEXT.available : SERVICE_MANAGEMENT_TEXT.unavailable}
            />
            <DetailItem
              label={SERVICE_MANAGEMENT_TEXT.createdBy}
              value={service.creatorName ?? "—"}
            />
          </div>

          {/* Service Images */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold leading-6 text-ink">{SERVICE_MANAGEMENT_TEXT.serviceImagesLabel}</h3>
            <div className="flex flex-wrap gap-4">
              {service.images && service.images.length > 0 ? (
                service.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-xl border border-line"
                  >
                    <img
                      src={img}
                      alt={`${service.name} ${idx + 1}`}
                      className="h-20 w-20 object-cover"
                    />
                  </div>
                ))
              ) : (
                <p className="text-xs leading-4 font-normal text-ink-disabled">{SERVICE_MANAGEMENT_TEXT.noImages}</p>
              )}
            </div>
          </div>

          {/* Includes & Excludes */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-md font-semibold leading-6 text-ink">
                {SERVICE_MANAGEMENT_TEXT.cleaningIncludes}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {service.includeServices &&
                service.includeServices.length > 0 ? (
                  service.includeServices.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-line px-2 py-1 rounded-[4px] w-fit text-[12px] leading-4 tracking-[0.4%] font-normal text-ink"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-xs leading-4 font-normal text-ink-disabled">{SERVICE_MANAGEMENT_TEXT.noneListed}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold leading-6 text-ink">
                {SERVICE_MANAGEMENT_TEXT.cleaningExcludes}
              </h3>
              <div className="flex flex-wrap gap-3">
                {service.excludeServices &&
                service.excludeServices.length > 0 ? (
                  service.excludeServices.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-line px-2 py-1 rounded-[4px] w-fit text-[12px] leading-4 tracking-[0.4%] font-normal text-ink"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-xs leading-4 font-normal text-ink-disabled">{SERVICE_MANAGEMENT_TEXT.noneListed}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <AddEditService
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        isEdit={true}
        initialData={{
          id: service.id,
          name: service.name,
          price: parseFloat(service.price),
          duration: service.duration,
          subCategory: service.subCategoryId.toString(),
          commission: parseFloat(service.commission),
          categoryId: service.subCategory?.categoryId.toString(),
          availability: service.availability,
          serviceIncludes: service.includeServices.length > 0,
          serviceExcludes: service.excludeServices.length > 0,
          inclusionPointsList: service.includeServices,
          exclusionPointsList: service.excludeServices,
          serviceImages: service.images,
          serviceImagesIds: service.cloudinaryIds,
        }}
        onSave={() => {
          fetchServiceDetails();
          setOpenEditDialog(false);
        }}
      />
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <p className="text-sm leading-5 font-normal text-ink-muted">{label}</p>
    <p className="text-base font-normal leading-5.5 text-ink">
      {value}
    </p>
  </div>
);

export default ServiceDetail;
