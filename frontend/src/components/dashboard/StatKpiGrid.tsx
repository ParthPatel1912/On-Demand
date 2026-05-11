import { CircleDollarSign, UserRound, Wrench, BadgeCheck } from "lucide-react";

import { dashboardStat1 } from "@/assets";
import type { IDashboardKpi, StatCardData } from "@/types/dashboard.interface";
import { CARD_CLASSNAME } from "./constants";

const StatIcon = ({ iconKey }: { iconKey: StatCardData["iconKey"] }) => {
  const common = "h-8 w-8 text-white";
  switch (iconKey) {
    case "calendar":
      return (
        <img
          src={dashboardStat1}
          alt="Calendar Icon"
          className="h-8 w-8 object-contain"
        />
      );
    case "users":
      return <UserRound className={common} />;
    case "wrench":
      return <Wrench className={common} />;
    case "dollar":
      return <CircleDollarSign className={common} />;
    case "badge-check":
      return <BadgeCheck className={common} />;
  }
};

type KpiCard = StatCardData | IDashboardKpi;

const StatKpiGrid = ({
  cards,
  comparisonLabel = "Then Last Week",
  column = 4,
}: {
  cards: KpiCard[];
  comparisonLabel?: string;
  column?: number;
}) => {
  const xlCols =
    column === 3
      ? "xl:grid-cols-3"
      : column === 2
        ? "xl:grid-cols-2"
        : "xl:grid-cols-4";
  return (
    <section className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${xlCols}`}>
      {cards.map((card) => (
        <article key={card.title} className={`${CARD_CLASSNAME} p-4`}>
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-3xl leading-9 font-semibold text-ink">
                {card.value}
              </p>
              <p className="text-sm font-medium text-ink-muted">{card.title}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <StatIcon iconKey={card.iconKey} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                card.positive
                  ? "bg-dashboard-positive-soft text-dashboard-positive"
                  : "bg-dashboard-negative-soft text-dashboard-negative"
              }`}
            >
              {card.change}
            </span>
            <span className="text-xs font-medium text-ink-muted">
              {comparisonLabel}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
};

export default StatKpiGrid;
