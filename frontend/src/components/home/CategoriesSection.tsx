import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/layout/Container";
import { fetchHomeServiceTypes, type HomeServiceType } from "@/api/homeServices";
import { HorizontalCarousel } from "./HorizontalCarousel";
import { CategoryCard, CategoryCardSkeleton } from "./CategoryCard";
import { HOME_TEXT } from "@/constants/home.text";

const CategoriesSection = () => {
  const [serviceTypes, setServiceTypes] = useState<HomeServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchHomeServiceTypes();
        if (!cancelled) setServiceTypes(data);
      } catch {
        if (!cancelled) setServiceTypes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () =>
      serviceTypes.map((st) => ({
        id: String(st.id),
        title: st.name,
        iconSrc: st.image,
        iconAlt: "",
      })),
    [serviceTypes],
  );

  return (
    <section className="pt-12 sm:pt-16">
      <Container>
        <h2 className="text-xl font-bold leading-8 tracking-[0.0025em] text-center text-foreground sm:text-heading sm:leading-9.5 lg:text-[32px] lg:leading-11">
          {HOME_TEXT.categoriesTitle}
        </h2>

        <HorizontalCarousel className="mt-6">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))
            : categories.map((category) => (
                <CategoryCard key={category.title} category={category} />
              ))}
        </HorizontalCarousel>
      </Container>
    </section>
  );
};

export default CategoriesSection;
