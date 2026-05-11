import { Pie, PieChart, Tooltip } from "recharts";

import PeriodTabs from "./PeriodTabs";
import type {
  IServicePie,
  ITopServicesProps,
} from "@/types/dashboard.interface";
import { CARD_CLASSNAME } from "./constants";
import { UI_COLORS } from "@/constants/colors";
import DashboardEmptyState from "./DashboardEmptyState";
import { DASHBOARD_TEXT } from "@/constants/dashboard.text";

const TopServicesCard = ({
  title,
  period,
  isRevenueServices = false,
  onPeriodChange,
  data,
  currency = "₹",
}: ITopServicesProps & { currency?: string }) => {
  const { services, totalBookings } = data ?? {
    services: [],
    totalBookings: 0,
  };

  const pieData: IServicePie[] = services.map((s) => ({
    name: s.label,
    value: s.value,
    fill: s.color,
  }));

  return (
    <article className={`${CARD_CLASSNAME} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold leading-6 text-ink">
          {title || "Top Performing Services"}
        </h2>
        <PeriodTabs value={period} onChange={onPeriodChange} />
      </div>

      {totalBookings === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid grid-cols-[220px_1fr] gap-6 max-lg:grid-cols-1">
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-45 w-45">
              <PieChart width="100%" height="100%">
                <Tooltip
                  position={{ x: 0, y: 220 }}
                  contentStyle={{
                    backgroundColor: UI_COLORS.white,
                    border: `1px solid ${UI_COLORS.lineCard}`,
                    borderRadius: "10px",
                    fontSize: "12px",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                  }}
                  formatter={(value, name) =>
                    value != null
                      ? [
                          isRevenueServices
                            ? `${currency}${Number(value).toFixed(2)}`
                            : `${Number(value).toFixed(2)} Bookings`,
                          name,
                        ]
                      : ["", name]
                  }
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke={UI_COLORS.white}
                  strokeWidth={6}
                  isAnimationActive={true}
                />
              </PieChart>

              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white">
                <p className="text-3xl font-bold text-ink">{totalBookings}</p>
                <p className="text-xs font-normal text-ink-muted">Bookings</p>
              </div>
            </div>
          </div>

          <div className="max-h-70 h-full overflow-y-auto pr-2">
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.label}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line-soft pb-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-xs"
                      style={{ backgroundColor: service.color }}
                    />
                    <p className="text-sm font-normal text-ink">
                      {service.label}
                    </p>
                  </div>
                  <p className="text-right text-[16px] font-bold text-ink">
                    {isRevenueServices ? `${currency}` : ""}
                    {service.value.toFixed(2)}{" "}
                    <span className="text-xs font-medium text-ink-muted">
                      {isRevenueServices
                        ? DASHBOARD_TEXT.tooltipRevenue
                        : DASHBOARD_TEXT.tooltipBookings}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default TopServicesCard;
