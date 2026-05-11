import { memo } from "react";
import { Skeleton } from "../ui/skeleton";

export const LogTableSkeleton = memo(({ limit = 10 }: { limit?: number }) => (
  <div className="animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center border-b border-neutral-100 bg-grey-50/50 px-4 py-3">
      <div className="w-48 pr-4">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="w-40 pr-4">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex-1 pr-4">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="w-32 pr-4">
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="w-24 pr-4">
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="w-48">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    {/* Row skeletons */}
    {Array.from({ length: limit }).map((_, i) => (
      <div
        key={i}
        className="flex items-center border-b border-neutral-100 px-4 py-4 last:border-0"
      >
        <div className="w-48 pr-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="w-40 pr-4">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 pr-4">
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="w-32 pr-4">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="w-24 pr-4">
          <Skeleton className="h-6 w-20 rounded" />
        </div>
        <div className="w-48">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    ))}
  </div>
));
