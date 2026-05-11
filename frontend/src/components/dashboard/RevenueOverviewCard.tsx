import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PeriodTabs from "./PeriodTabs";
import type { IRevenueOverviewProps } from "@/types/dashboard.interface";
import { CARD_CLASSNAME } from "./constants";
import { UI_COLORS } from "@/constants/colors";
import DashboardEmptyState from "./DashboardEmptyState";
import { DASHBOARD_TEXT } from "@/constants/dashboard.text";

const RevenueOverviewCard = ({
  period,
  onPeriodChange,
  data,
  currency = "₹",
}: IRevenueOverviewProps & { currency?: string }) => {
  const bars = (data?.bars ?? []).map((bar) => ({
    label: bar.label ?? bar.day ?? "",
    amount: bar.amount,
  }));
  const yTicks = data?.yTicks ?? [];
  const yTickLabels = data?.yTickLabels ?? [];

  const isEmpty = !bars.length || bars.every((b) => Number(b.amount) === 0);

  const tickFormatter = useMemo(() => {
    const map = new Map<number, string>();
    yTicks.forEach((v, idx) => map.set(v, yTickLabels[idx] ?? ""));
    return (value: number) => map.get(value) ?? "";
  }, [yTicks, yTickLabels]);

  return (
    <article className={`${CARD_CLASSNAME} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold leading-6 text-ink">
          {DASHBOARD_TEXT.revenueOverview}
        </h2>
        <PeriodTabs value={period} onChange={onPeriodChange} />
      </div>

      <div className="relative h-65 w-full">
        {isEmpty ? (
          <DashboardEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bars}
              margin={{ top: 8, right: 6, left: 0, bottom: 0 }}
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
                ticks={yTicks}
                tickLine={false}
                axisLine={true}
                stroke={UI_COLORS.chartGrid}
                tick={{
                  color: UI_COLORS.chartTick,
                  fill: UI_COLORS.chartTick,
                  fontSize: 12,
                  fontWeight: 500,
                }}
                width={"auto"}
                tickFormatter={(value) => tickFormatter(Number(value))}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: UI_COLORS.white,
                  border: `1px solid ${UI_COLORS.lineCard}`,
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                }}
                labelStyle={{ color: UI_COLORS.grey500, fontWeight: 600 }}
                formatter={(value) => {
                  if (value == null) return ["", DASHBOARD_TEXT.tooltipRevenue];
                  return [`${currency}${value}`, DASHBOARD_TEXT.tooltipRevenue];
                }}
              />
              <Bar
                dataKey="amount"
                fill={UI_COLORS.primary}
                barSize={26}
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
};

export default RevenueOverviewCard;
