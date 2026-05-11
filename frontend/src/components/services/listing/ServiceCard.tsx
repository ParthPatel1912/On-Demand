import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import placeholderServiceImage from "@/assets/services/placeholder-service.svg";
import { SERVICE_CARD_TEXT } from "@/constants/serviceCard.text";
import { APP_ROUTES } from "@/routes/config";

export interface IService {
  id: string;
  name: string;
  duration: string;
  price: string;
  includeServices: string[];
  excludeServices: string[];
  images: string[];
}

interface IProps {
  service: IService;
}

export const ServiceCard = ({ service }: IProps) => {
  const navigate = useNavigate();
  const handleViewDetails = () => {
    navigate(
      APP_ROUTES.SERVICE_DETAILS.replace(":serviceId", String(service.id))
    );
  };

  const handleRedirectCheckout = () => navigate(
    APP_ROUTES.CHECKOUT.replace(":serviceId", String(service.id))
  );

  return (
    <div className="border-b border-line last:border-b-0 pb-4 md:pb-6 last:pb-0">
      <div className="flex flex-col md:flex-row items-start gap-4">
        {/* Service Image - First on mobile, second on desktop */}
        <div className="relative w-full md:w-40 h-30 md:h-40 shrink-0 rounded-lg overflow-visible mx-auto md:mx-0 order-1 md:order-2">
          <img
            src={service.images[0] || placeholderServiceImage}
            alt={service.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderServiceImage;
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedirectCheckout}
            className="absolute -bottom-4 md:-bottom-5 left-1/2 -translate-x-1/2 rounded-full border-2 text-primary font-bold text-xs md:text-sm py-1 md:py-2 px-2 md:px-3"
          >
            <Plus className="h-3 w-3 md:h-5 md:w-5" />
            <span className="hidden md:inline ml-1">{SERVICE_CARD_TEXT.addBtn}</span>
            <span className="md:hidden">{SERVICE_CARD_TEXT.addBtn}</span>
          </Button>
        </div>

        {/* Service Content - Second on mobile, first on desktop */}
        <div className="flex-1 w-full order-2 md:order-1">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-[16px] md:text-base leading-5.5 md:leading-5.5 tracking-[0.15%] text-ink mb-2 break-all">
                {service.name}
              </h3>
              <div className="flex flex-col gap-1 md:gap-2">
                <span className="text-xs md:text-sm font-medium leading-5 md:leading-5 tracking-[0.1%] text-ink-muted">
                  {service.duration || "0"} {SERVICE_CARD_TEXT.minText}
                </span>
                <span className="font-semibold text-[14px] md:text-[14px] leading-5 md:leading-5 tracking-[0.1%] text-ink align-middle font-montserrat">
                  ${service.price}
                </span>
              </div>
            </div>
          </div>

          <div className="border-b border-dashed border-grey-200 mb-10 md:mb-4"></div>

          <ul className={`text-ink text-xs md:text-sm font-normal leading-5 md:leading-5 tracking-[0.25%] mb-3 md:mb-4 list-disc pl-6 ${service.includeServices.length || service.excludeServices.length
            ? "marker:text-current"
            : "marker:text-transparent"
            }`}>
            <li>
              {service.includeServices.length > 0 &&
                `${SERVICE_CARD_TEXT.forText}${service.includeServices.join(", ")}`}
              {service.excludeServices.length > 0 &&
                `${SERVICE_CARD_TEXT.excludesText}${service.excludeServices.join(", ")}`}
            </li>
          </ul>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-2 text-primary font-bold text-xs md:text-sm py-1 md:py-2 px-3 md:px-4"
            onClick={handleViewDetails}
          >
            <span className="hidden md:inline">{SERVICE_CARD_TEXT.viewDetailsBtn}</span>
            <span className="md:hidden">{SERVICE_CARD_TEXT.detailsBtn}</span>
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
