import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Period } from "@/types/dashboard.interface";

interface IProps {
  value: Period;
  onChange: (period: Period) => void;
}

const TABS: { label: string; value: Period }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

const triggerClassName =
  "rounded-[4px] font-alexandria! px-3 py-1 text-xs font-medium text-ink data-[state=active]:bg-white";

const PeriodTabs = ({ value, onChange }: IProps) => {
  return (
    <Tabs value={value} onValueChange={(val) => onChange(val as Period)}>
      <TabsList className="h-auto rounded-[6px] border border-line-period-tab bg-line-period-tab p-0.5">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={triggerClassName}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default PeriodTabs;
