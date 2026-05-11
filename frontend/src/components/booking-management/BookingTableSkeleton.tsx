import { Skeleton } from "../ui/skeleton";

export const BookingTableSkeleton = () => {
  return (
    <div className="bg-white p-4 space-y-4">
      <div className="grid grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {Array.from({ length: 10 }).map((_, row) => (
        <div key={row} className="grid grid-cols-6 gap-4 py-3">
          {Array.from({ length: 6 }).map((_, col) => (
            <Skeleton key={col} className="h-6 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
