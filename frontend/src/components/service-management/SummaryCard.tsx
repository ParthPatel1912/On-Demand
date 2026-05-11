import { GripVertical } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IProps {
  name: string;
  count: number;
  isActive?: boolean;
  onClick?: () => void;
}

export const SummaryCard = ({ name, count, isActive, onClick }: IProps) => {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={cn(
        "relative overflow-hidden transition-colors cursor-pointer",
        "bg-card hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "border-primary/50 ring-1 ring-primary/40 bg-surface-subtle"
          : "border-border"
      )}
    >
      <CardContent className="flex items-center justify-between p-4 pl-3 pr-3 h-18">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-ink-disabled/40" />
          <span className="font-bold text-sm text-ink-slate">{name}</span>
        </div>
        <span className="text-xl font-bold text-ink-slate">{count}</span>
      </CardContent>
    </Card>
  );
};
