import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PeriodTabs from "./PeriodTabs";
import type { ITopCitiesProps } from "@/types/dashboard.interface";
import { CARD_CLASSNAME } from "./constants";
import { UI_COLORS } from "@/constants/colors";
import DashboardEmptyState from "./DashboardEmptyState";
import { DASHBOARD_TEXT } from "@/constants/dashboard.text";

const formatCitiesTick = (value: number) => {
  if (!value) return "0";
  if (value >= 1000000) return "1M";
  if (value >= 1000) {
    const k = Math.round(value / 1000);
    return `${k}k`;
  }
  return `${Math.round(value)}`;
};

const TopCitiesCard = ({ period, onPeriodChange, data }: ITopCitiesProps) => {
  const xLabels = data?.xLabels ?? [];
  const series = data?.series ?? [];
  const yTicks = data?.yTicks ?? [];

  const chartData = useMemo(() => {
    return xLabels.map((label, idx) => {
      const obj: Record<string, string | number> = { label };
      series.forEach((s) => {
        obj[s.name] = s.data[idx] ?? null;
      });
      return obj;
    });
  }, [xLabels, series]);

  return (
    <article
      className={`${CARD_CLASSNAME} p-5 ${series.length > 0 ? "min-h-100" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold leading-6 text-ink">
          {DASHBOARD_TEXT.topCitiesByBookings}
        </h2>
        <PeriodTabs value={period} onChange={onPeriodChange} />
      </div>

      <div className="relative h-[80%] w-full">
        {series.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 6, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke={UI_COLORS.chartGrid}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={true}
                stroke={UI_COLORS.chartGrid}
                tick={{
                  color: UI_COLORS.chartTick,
                  fill: UI_COLORS.chartTick,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <YAxis
                domain={[0, "dataMax"]}
                ticks={yTicks}
                tickLine={false}
                axisLine={true}
                stroke={UI_COLORS.chartGrid}
                width={48}
                tick={{
                  color: UI_COLORS.chartTick,
                  fill: UI_COLORS.chartTick,
                  fontSize: 12,
                  fontWeight: 500,
                }}
                tickFormatter={(value) => formatCitiesTick(Number(value))}
              />
              <Tooltip content={() => null} />
              {series.map((s) => (
                <Line
                  key={s.name}
                  type="monotone"
                  connectNulls
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={3.5}
                  dot={{
                    r: 4,
                    fill: s.color,
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                  activeDot={false}
                  isAnimationActive={true}
                />
              ))}
              <Tooltip
                contentStyle={{
                  backgroundColor: UI_COLORS.white,
                  border: `1px solid ${UI_COLORS.lineCard}`,
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                }}
                labelStyle={{
                  color: UI_COLORS.grey500,
                  fontWeight: 600,
                }}
                formatter={(value, name) =>
                  value != null
                    ? [`${formatCitiesTick(Number(value))}`, name]
                    : ["", name]
                }
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-6 text-xs font-semibold text-grey-500">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-xs"
              style={{ background: s.color }}
            />
            {s.name}
          </div>
        ))}
      </div>
    </article>
  );
};

export default TopCitiesCard;
