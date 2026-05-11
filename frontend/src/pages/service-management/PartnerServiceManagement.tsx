import { useEffect, useState } from "react";
import { Loader, LayoutGrid } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { CategorySection } from "@/components/service-management/CategorySection";
import PageTitle from "@/components/common/PageTitle";
import axiosInstance from "@/helper/axiosInstance";
import type { ServiceHierarchy } from "@/types/masterData.interface";
import { SERVICE_MANAGEMENT_TEXT } from "@/constants/serviceManagement.text";

const PartnerServiceManagementPage = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceHierarchy[]>([]);
  const [loading, setLoading] = useState(false);

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

  const [openSection, setOpenSection] = useState<string | undefined>();

  return (
    <>
      <PageTitle title={SERVICE_MANAGEMENT_TEXT.pageTitle} />

      <main>
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            <span className="text-sm">{SERVICE_MANAGEMENT_TEXT.loadingServices}</span>
          </div>
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
                isOpen={openSection === serviceType.id.toString()}
                onServiceSave={fetchServiceHierarchy}
              />
            ))}
          </Accordion>
        )}
      </main>
    </>
  );
};

export default PartnerServiceManagementPage;
