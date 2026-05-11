import { Skeleton } from "@/components/ui/skeleton";

const BookingCardSkeleton = () => (
  <div className="relative pl-15">
    <div className="absolute left-0 top-0">
      <Skeleton className="w-[72px] h-[60px] rounded-l-[8px]" />
    </div>

    <div
      className="relative bg-white rounded-lg px-4 py-3 shadow-sm"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4">
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-4 w-12" />
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
        <Skeleton className="h-3 w-36 mb-2.5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

interface BookingListSkeletonProps {
  count?: number;
}

const BookingListSkeleton = ({ count = 3 }: BookingListSkeletonProps) => (
  <div className="space-y-4 px-1 sm:px-4 md:px-0">
    {Array.from({ length: count }).map((_, i) => (
      <BookingCardSkeleton key={i} />
    ))}
  </div>
);

export default BookingListSkeleton;
