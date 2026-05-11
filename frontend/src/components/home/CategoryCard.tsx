import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/routes/config";
import { DEFAULT_ICON } from "@/utils/constants";

export type Category = {
  id: string;
  title: string;
  iconSrc: string;
  iconAlt?: string;
};

interface IProps {
  category: Category;
  className?: string;
}

export const CategoryCard = ({ category, className }: IProps) => {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "flex shrink-0 w-38 sm:w-42 lg:w-42 flex-col gap-3 cursor-pointer",
        className,
      )}
      onClick={() => {
        navigate(
          APP_ROUTES.SERVICE_LISTING.replace(
            ":serviceTypeId",
            String(category.id),
          ),
        );
      }}
    >
      <div className="flex h-30 w-full items-center justify-center rounded-2xl bg-muted">
        {category.iconSrc ? (
          <img
            src={category.iconSrc}
            alt={category.iconAlt ?? ""}
            className="h-16 w-auto"
            loading="lazy"
          />
        ) : (
          <span className="h-12 w-12 text-4xl">{DEFAULT_ICON}</span>
        )}
      </div>
      <p
        title={category.title}
        className="overflow-hidden text-ellipsis text-base leading-5.5 text-center"
      >
        {category.title}
      </p>
    </div>
  );
};

type CategoryCardSkeletonProps = {
  className?: string;
};

export function CategoryCardSkeleton({ className }: CategoryCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 w-38 sm:w-42 lg:w-45 flex-col gap-3",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex h-30 w-full items-center justify-center rounded-2xl bg-muted animate-pulse" />
      <div className="mx-auto h-4 w-3/4 rounded bg-muted animate-pulse" />
    </div>
  );
}
