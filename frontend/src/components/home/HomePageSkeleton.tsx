import { Container } from "@/components/layout/Container";

const HomePageSkeleton = () => {
  return (
    <main className="flex-1">
      {/* Hero Section Skeleton */}
      <section className="pt-10 sm:pt-14">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="flex max-w-131 flex-col gap-16">
              <div className="flex flex-col gap-6">
                <div className="h-12 w-3/4 animate-pulse rounded bg-gray-300"></div>
                <div className="h-6 w-full animate-pulse rounded bg-gray-300"></div>
                <div className="h-12 w-full animate-pulse rounded bg-gray-300"></div>
              </div>
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-16">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                <div className="h-8 w-20 animate-pulse rounded bg-gray-300"></div>
              </div>
            </div>
            <div className="order-first flex justify-center lg:order-last lg:justify-end">
              <div className="h-64 w-full max-w-145 animate-pulse rounded bg-gray-300"></div>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Section Skeleton */}
      <section className="pt-12 sm:pt-16">
        <Container>
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-300 mx-auto mb-6"></div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-24 w-24 animate-pulse rounded bg-gray-300 shrink-0"
              ></div>
            ))}
          </div>
        </Container>
      </section>

      {/* Popular Services Section Skeleton */}
      <section className="pt-12 sm:pt-16">
        <Container>
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-1/3 animate-pulse rounded bg-gray-300"></div>
            <div className="h-10 w-20 animate-pulse rounded bg-gray-300"></div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-48 w-48 animate-pulse rounded bg-gray-300 shrink-0"
              ></div>
            ))}
          </div>
        </Container>
      </section>

      {/* All Services Section Skeleton */}
      <section className="pt-12 sm:pt-16">
        <Container>
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-1/3 animate-pulse rounded bg-gray-300"></div>
            <div className="h-10 w-20 animate-pulse rounded bg-gray-300"></div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-48 w-48 animate-pulse rounded bg-gray-300 shrink-0"
              ></div>
            ))}
          </div>
        </Container>
      </section>

      {/* Join Partner Section Skeleton */}
      <section className="pt-6 pb-3">
        <Container>
          <div className="relative lg:h-96.25">
            <div className="h-64 w-64 animate-pulse rounded bg-gray-300 absolute right-0 -top-24 hidden sm:block"></div>
            <div className="mt-28 h-68 max-h-70 overflow-hidden rounded-3xl bg-gray-300">
              <div className="flex h-full items-start px-6 pt-8 sm:px-10 sm:pt-12 lg:px-15">
                <div className="flex w-full max-w-145 flex-col gap-10 md:pr-70 lg:pr-0">
                  <div className="space-y-3">
                    <div className="h-12 w-2/3 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default HomePageSkeleton;
