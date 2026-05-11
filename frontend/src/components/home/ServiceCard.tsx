import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/routes/config";
import placeholderServiceImage from "@/assets/services/placeholder-service.svg";
import { SERVICE_CARD_TEXT } from "@/constants/serviceCard.text";

interface IService {
  id: string;
  title: string;
  price: string;
  imageSrc: string;
  imageAlt?: string;
}

interface IProps {
  service: IService;
  className?: string;
  onAdd?: (service: IService) => void;
}

export const ServiceCard = ({ service, className, onAdd }: IProps) => {
  const navigate = useNavigate();
  return (
    <Card
      className={cn(
        "w-55.25 rounded-3xl bg-background ring-0 cursor-pointer gap-0",
        className,
      )}
      onClick={() => {
        navigate(
          APP_ROUTES.SERVICE_DETAILS.replace(":serviceId", String(service.id)),
        );
      }}
    >
      <img
        src={service.imageSrc || placeholderServiceImage}
        alt={service.imageAlt ?? service.title}
        className="h-58.25 min-w-55.25 rounded-2xl object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = placeholderServiceImage;
        }}
      />

      <div className="mt-1 flex flex-1 flex-col p-1">
        <p
          title={service.title}
          className="line-clamp-2 min-h-11 text-base font-medium leading-5.5 overflow-hidden text-ellipsis"
        >
          {service.title}
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium leading-4 text-muted-foreground">
              {SERVICE_CARD_TEXT.startsAt}
            </p>
            <p className="text-md font-semibold leading-6 text-foreground">
              {service.price}
            </p>
          </div>

          <Button
            variant="outline"
            className="h-10 rounded-full border-2 px-4 text-sm font-bold leading-5 text-primary hover:bg-primary/5"
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.(service)
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            {SERVICE_CARD_TEXT.addBtn}
          </Button>
        </div>
      </div>
    </Card>
  );
};

type ServiceCardSkeletonProps = {
  className?: string;
};

export function ServiceCardSkeleton({ className }: ServiceCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "max-w-55.25 rounded-3xl bg-background p-1 ring-0",
        className,
      )}
      aria-hidden="true"
    >
      <div className="h-58.25 w-full rounded-2xl bg-muted animate-pulse" />

      <div className="mt-4 flex flex-1 flex-col">
        <div className="min-h-11">
          <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
          <div className="mt-2 h-4 w-3/5 rounded bg-muted animate-pulse" />
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-5 w-20 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-10 w-24 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </Card>
  );
}
