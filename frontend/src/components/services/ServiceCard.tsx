import { useNavigate } from "react-router-dom";

import { DEFAULT_ICON } from "@/utils/constants";
import type { IHomeServiceType } from "@/types/service.interface";
import { formatBookings } from "@/utils";
import { APP_ROUTES } from "@/routes/config";

interface IProps {
  service: IHomeServiceType;
  onClick?: (service: IHomeServiceType) => void;
}

const ServiceCard = ({ service, onClick }: IProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(service);
    } else {
      navigate(
        APP_ROUTES.SERVICE_LISTING.replace(":serviceTypeId", String(service.id)), {
        state: { serviceType: service },
      });
    }
  };

  const countLabel = formatBookings(service.bookings);
  return (
    <button
      onClick={handleClick}
      className={[
        "group relative w-full text-left",
        "rounded-2xl bg-surface-neutral",
        "px-4.5 pt-5 pb-4.5",
        "flex flex-col justify-between",
        "transition-all duration-200 cursor-pointer",
        "border border-transparent",
      ].join(" ")}
      style={{ minHeight: 280 }}
    >
      <p
        className="text-xl font-medium text-ink leading-5.5 wrap-break-word"
        // style={{ maxWidth: "calc(100% - 40px)" }}
      >
        {service.name}
      </p>

      <div className="flex items-center justify-between w-full mt-4">
        <div className="flex flex-col justify-center">
          <p className="text-lg font-semibold text-ink leading-none">
            {countLabel}
          </p>
          <p className="text-xs font-medium text-ink-muted mt-0.75 leading-none">
            Bookings
          </p>
        </div>

        <div className="w-16 h-16 flex items-center justify-center shrink-0 transition-transform duration-200">
          {service.image ? (
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <span className="text-4xl text-center justify-center">
              {DEFAULT_ICON}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ServiceCard;
