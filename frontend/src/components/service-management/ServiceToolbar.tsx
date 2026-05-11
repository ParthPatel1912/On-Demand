import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface IProps {
  searchPlaceholder?: string;
  primaryAction?: ReactNode;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryAction?: ReactNode;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  rightSlot?: ReactNode;
  className?: string;
}

export const ServiceToolbar = ({
  primaryAction,
  onPrimaryAction,
  primaryActionLabel = "Add",
  secondaryAction,
  onSecondaryAction,
  secondaryActionLabel = "Filter",
  rightSlot,
  className,
}: IProps) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center",
        className
      )}
    >
      <div className="flex items-center justify-end gap-3">
        {rightSlot}
        {secondaryAction ??
          (onSecondaryAction ? (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null)}
        {primaryAction ??
          (onPrimaryAction ? (
            <Button onClick={onPrimaryAction}>{primaryActionLabel}</Button>
          ) : null)}
      </div>
    </div>
  );
};
