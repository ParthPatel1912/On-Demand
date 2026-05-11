import { useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import {
  serviceImg1,
  serviceImg2,
  serviceImg3,
  serviceImg4,
  serviceImg5,
  serviceImg6,
} from "@/assets";

export const BANNER_PANELS = [
  {
    imageSrc: serviceImg1,
    imageAlt: "Home cleaning service",
  },
  {
    imageSrc: serviceImg2,
    imageAlt: "Salon and beauty service",
  },
  {
    imageSrc: serviceImg3,
    imageAlt: "AC repair service",
  },
  {
    imageSrc: serviceImg4,
    imageAlt: "Massage therapy service",
  },
  {
    imageSrc: serviceImg5,
    imageAlt: "Electrical repair service",
  },

  {
    imageSrc: serviceImg6,
    imageAlt: "Plumbing service",
  },
];

const BannerSections = () => {
  const [count, setCount] = useState(7);
  useEffect(() => {
    const updateCount = () => {
      const width = window.innerWidth;
      const maxColumns = 7;
      const minColumns = 1;
      const calculated = Math.floor(width / 185);
      let finalCount = Math.min(maxColumns, calculated);
      finalCount = Math.max(minColumns, finalCount);
      setCount(finalCount);
    };

    updateCount();
    window.addEventListener("resize", updateCount);

    return () => window.removeEventListener("resize", updateCount);
  }, []);
  const visiblePanels = BANNER_PANELS.slice(0, count);

  return (
    <Container className="mt-4 md:mt-8 max-w-300 px-4 md:px-0">
      <div className="relative h-50 md:h-100 md:mx-6 rounded-2xl md:rounded-3xl overflow-hidden">
        <div className="absolute inset-0 flex">
          {visiblePanels.map((panel, i) => (
            <div key={i} className="flex-1 h-full">
              <img
                src={panel.imageSrc}
                alt={panel.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white text-[32px] md:text-[48px] font-black text-center animate-in fade-in slide-in-from-left-10 duration-700">
            Services
          </h1>
        </div>
      </div>
    </Container>
  );
};

export default BannerSections;
