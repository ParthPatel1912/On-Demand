import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import axiosInstance from "@/helper/axiosInstance";
import { Container } from "@/components/layout/Container";
import type { IHomeServiceType } from "@/types/service.interface";
import { APP_ROUTES } from "@/routes/config";

const CardSections = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<IHomeServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);

      // const res = await axiosInstanceLaravel.get("/service-types/public");
      const res = await axiosInstance.get("/service-types/public");
      const data = res.data.data;
      setServices(data);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceClick = (service: IHomeServiceType) => {
    navigate(
      APP_ROUTES.SERVICE_LISTING.replace(":serviceTypeId", String(service.id)),
      {
        state: { serviceType: service },
      }
    );
  };

  return (
    <Container className="py-6">
      {loading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      )}
      {!loading && services.length === 0 && (
        <div className="min-h-[calc(70vh-380px)] flex items-center justify-center text-gray-500">
          No services found
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={handleServiceClick}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default CardSections;
