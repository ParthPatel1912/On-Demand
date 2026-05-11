const ServiceCardSkeleton = () => {
  return (
    <div className="relative h-44 rounded-2xl bg-gray-100 p-4 overflow-hidden animate-pulse">
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>

      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
      <div className="absolute bottom-4 left-4">
        <div className="h-4 w-12 bg-gray-200 rounded mb-1"></div>
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="absolute bottom-4 right-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;
