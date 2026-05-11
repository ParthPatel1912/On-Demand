import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SectionCardSkeleton = ({
  titleWidth = "w-40",
  items = 4,
}: {
  titleWidth?: string;
  items?: number;
}) => (
  <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
    <CardContent className="p-6 md:p-8">
      <Skeleton className={`h-5 ${titleWidth} mb-4`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const BookingDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCardSkeleton titleWidth="w-32" items={4} />
        <SectionCardSkeleton titleWidth="w-56" items={4} />
      </div>

      <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6 md:p-8">
          <Skeleton className="h-5 w-48 mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetailsSkeleton;