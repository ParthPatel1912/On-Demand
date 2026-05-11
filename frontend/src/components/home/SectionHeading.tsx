import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHeading = ({ title, action, className }: IProps) => {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <h2 className="text-[22px] font-bold sm:text-[32px]">{title}</h2>
      {action}
    </div>
  );
};
