import { useCallback, useEffect, useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CategorySection } from "@/components/service-management/CategorySection";
import PageTitle from "@/components/common/PageTitle";
import ServicePopup from "../../components/master-data/ServicePopup";
import ServiceTypeForm from "../../components/master-data/ServiceTypeForm";
import axiosInstance from "@/helper/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  IServiceType,
  ModalType,
  ServiceHierarchy,
} from "@/types/masterData.interface";
import { SERVICE_MANAGEMENT_TEXT } from "@/constants/serviceManagement.text";

const ServiceManagementPage = () => {
  const [openServicePopup, setOpenServicePopup] = useState(false);
  const [selectedServiceType, setSelectedServiceType] =
    useState<ServiceHierarchy | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceHierarchy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    type: ModalType;
    data: IServiceType | null;
  }>({
    type: null,
    data: null,
  });
  const closeModal = useCallback(() => {
    setModal({ type: null, data: null });
  }, []);

  const [openSection, setOpenSection] = useState<string | undefined>();

  // Fetch all service hirearchy   types API just for testing
  const fetchServiceHierarchy = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/service-types/hierarchy");
      const mappedData: ServiceHierarchy[] = res.data.data;
      setServiceTypes(mappedData);

      // Set the first item as open by default if none is set
      if (mappedData.length > 0 && !openSection) {
        setOpenSection(mappedData[0].id.toString());
      }
    } catch (err: unknown) {
      console.error(SERVICE_MANAGEMENT_TEXT.failedToFetch, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceHierarchy();
  }, []);

  // CREATE API integration
  const handleCreateService = async (
    values: { name: string; image: File | null; bannerImage: File | null },
    isEdit: boolean
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.image) {
        formData.append("image", values.image);
      }
      if (values.bannerImage) {
        formData.append("bannerImage", values.bannerImage);
      }

      if (isEdit && modal.data) {
        const response = await axiosInstance.put(
          `service-types/${modal.data.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const updatedData = response.data.data;
        setServiceTypes((prev) =>
          prev.map((item) => (item.id === modal.data?.id ? updatedData : item))
        );
        toast.success(SERVICE_MANAGEMENT_TEXT.serviceUpdated);
      } else {
        await axiosInstance.post("service-types", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await fetchServiceHierarchy();
        toast.success(SERVICE_MANAGEMENT_TEXT.serviceAdded);
      }
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  };

  const handleOpenServicePopup = (category: ServiceHierarchy) => {
    setSelectedServiceType(category);
    setOpenServicePopup(true);
  };

  const handleServiceType = (type: ModalType) => {
    setModal({ type, data: null });
  };

  const HierarchySkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-card px-6 py-4 border border-slate-100 h-16 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded" />{" "}
            {/* Grip icon placeholder */}
            <Skeleton className="h-6 w-6 rounded-md" /> {/* Category icon */}
            <Skeleton className="h-5 w-40" /> {/* Category name */}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />{" "}
            {/* Chevron circle pulse */}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <PageTitle title={SERVICE_MANAGEMENT_TEXT.pageTitle}>
        <Button size="sm" onClick={() => handleServiceType("add")}>
          <Plus className="h-5 w-5" />
          Add
        </Button>
      </PageTitle>

      <main>
        {loading ? (
          <HierarchySkeleton />
        ) : serviceTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="rounded-full bg-primary-soft p-5">
              <LayoutGrid className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-[17px] font-semibold text-ink-slate">
                No service types found
              </p>
              <p className="text-sm text-muted-foreground">
                Add a service type to get started.
              </p>
            </div>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="space-y-4"
          >
            {serviceTypes.map((serviceType) => (
              <CategorySection
                key={serviceType.id}
                serviceType={serviceType}
                onAddClick={handleOpenServicePopup}
                isOpen={openSection === serviceType.id.toString()}
                onServiceSave={fetchServiceHierarchy}
              />
            ))}
          </Accordion>
        )}
      </main>

      <ServiceTypeForm
        open={modal.type === "add" || modal.type === "edit"}
        service={modal.type === "edit" ? modal.data : null}
        onClose={closeModal}
        onSuccess={handleCreateService}
      />

      <ServicePopup
        open={openServicePopup}
        setOpen={setOpenServicePopup}
        serviceType={selectedServiceType}
        onHierarchyUpdated={fetchServiceHierarchy}
      />
    </>
  );
};

export default ServiceManagementPage;
