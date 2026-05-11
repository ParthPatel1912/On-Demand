import { Skeleton } from "@/components/ui/skeleton";

export const ContactInfoSkeleton = () => {
  return (
    <div className="w-full border border-line rounded-lg p-6 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white shadow-sm">
      <div className="flex flex-1 items-center justify-between w-full lg:pr-12 lg:border-r border-line gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="flex flex-1 items-center justify-between w-full lg:pl-6 gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
};

export const AddressListSkeleton = ({ count = 2 }: { count?: number }) => {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`flex items-start justify-between ${
            index !== 0 ? "pt-6 border-t border-line" : ""
          }`}
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const SavedAddressesSkeleton = () => {
  return (
    <div className="w-full border border-line rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <AddressListSkeleton />
    </div>
  );
};

export const AddAddressSkeleton = () => {
  return (
    <div className="flex flex-col">
      {/* Map Section */}
      <div className="px-6 pb-2">
        <Skeleton className="h-55 w-full bg-white relative overflow-hidden rounded-2xl border border-line shadow-sm z-0" />
      </div>

      {/* Address Details Section */}
      <div className="px-6 py-6 space-y-8">
        {/* Selected Address Display */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>

        <div className="w-full h-px bg-line" />

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* Save As Selection */}
        <div className="space-y-4">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-4">
            <Skeleton className="h-11 w-32 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="flex flex-col bg-white font-alexandria">
      <main className="grow container mx-auto px-4 py-12 max-w-300">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-9 w-40" />
          </div>

          <div className="flex flex-col gap-8">
            <ContactInfoSkeleton />
            <SavedAddressesSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
};
