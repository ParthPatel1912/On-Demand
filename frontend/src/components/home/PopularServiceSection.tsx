import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import type { HomeService } from "@/api/homeServices";
import { fetchPopularServices, formatPrice } from "@/api/homeServices";
import { APP_ROUTES } from "@/routes/config";
import { SectionHeading } from "./SectionHeading";
import { HorizontalCarousel } from "./HorizontalCarousel";
import { ServiceCard, ServiceCardSkeleton } from "./ServiceCard";
import { HOME_TEXT } from "@/constants/home.text";

const PopularServicesSection = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<HomeService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchPopularServices(10);
        if (!cancelled) setServices(data);
      } catch {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="pt-12 sm:pt-16" id="services">
      <Container>
        <SectionHeading
          title={HOME_TEXT.popularServicesTitle}
          action={
            <Link to={APP_ROUTES.SERVICES}>
              <Button
                variant="outline"
                className="h-10 rounded-full border-2 border-outlined-border px-4 text-sm font-bold leading-5 text-primary hover:bg-primary/5"
              >
                {HOME_TEXT.seeMoreBtn}{" "}
                <ArrowRight className="ml-2 size-4.5" aria-hidden="true" />
              </Button>
            </Link>
          }
        />

        <HorizontalCarousel className="mt-6">
          {loading
            ? Array.from({ length: 10 }).map((_, index) => (
                <ServiceCardSkeleton key={index} />
              ))
            : services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={{
                    id: String(service.id),
                    title: service.name,
                    price: formatPrice(service.price),
                    imageSrc: service.image,
                    imageAlt: service.name,
                  }}
                  onAdd={(s) =>
                    navigate(
                      APP_ROUTES.CHECKOUT.replace(
                        ":serviceId",
                        String(s.id)
                      )
                    )
                  }
                />
              ))}
        </HorizontalCarousel>
      </Container>
    </section>
  );
};

export default PopularServicesSection;
