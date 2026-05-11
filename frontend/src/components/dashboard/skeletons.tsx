import { CARD_CLASSNAME } from "./constants";

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-line-soft ${className}`} />
);

export const PeriodTabsSkeleton = () => (
  <div className="flex items-center gap-2">
    <SkeletonBlock className="h-8 w-16 rounded-full" />
    <SkeletonBlock className="h-8 w-16 rounded-full" />
    <SkeletonBlock className="h-8 w-16 rounded-full" />
  </div>
);

export const StatKpiGridSkeleton = () => (
  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 4 }).map((_, idx) => (
      <article key={idx} className={`${CARD_CLASSNAME} p-4`}>
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-4 w-28" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-line-soft">
            <SkeletonBlock className="h-8 w-8 rounded-full bg-line" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-14 rounded-md" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
      </article>
    ))}
  </section>
);

export const ChartCardSkeleton = ({ title }: { title: string }) => (
  <article className={`${CARD_CLASSNAME} p-5`}>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-md font-bold leading-6 text-ink-deep">{title}</h2>
      <PeriodTabsSkeleton />
    </div>
    <div className="rounded-xl border border-line-soft p-4">
      <SkeletonBlock className="h-65 w-full rounded-xl" />
    </div>
  </article>
);

export const TopServicesCardSkeleton = () => (
  <article className={`${CARD_CLASSNAME} p-5`}>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-md font-bold leading-6 text-ink-deep">
        Top Performing Services
      </h2>
      <PeriodTabsSkeleton />
    </div>

    <div className="grid grid-cols-[220px_1fr] gap-6 max-lg:grid-cols-1">
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex h-45 w-45 items-center justify-center">
          <SkeletonBlock className="h-44 w-44 rounded-full" />
          <div className="absolute flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
            <SkeletonBlock className="h-9 w-12" />
            <SkeletonBlock className="mt-2 h-3 w-16" />
          </div>
        </div>
      </div>

      <div className="max-h-70 h-full overflow-hidden pr-2">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line-soft pb-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-3 w-3 rounded-sm" />
                <SkeletonBlock className="h-4 w-40" />
              </div>
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </article>
);

export const TopPartnersCardSkeleton = () => (
  <article className={`${CARD_CLASSNAME} p-5`}>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-md font-bold leading-6 text-ink-deep">
        Top Service Partners
      </h2>
      <SkeletonBlock className="h-8 w-20 rounded-md" />
    </div>

    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between border-b border-line-soft px-2 py-4 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-6 w-6 rounded-full" />
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-32" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <SkeletonBlock className="ml-auto h-4 w-14" />
            <SkeletonBlock className="ml-auto h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  </article>
);
