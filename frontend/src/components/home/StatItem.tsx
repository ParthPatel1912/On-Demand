import { cn } from "@/lib/utils";

interface IProps {
  iconSrc: string;
  value: string;
  label: string;
  className?: string;
}

export const StatItem = ({ iconSrc, value, label, className }: IProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-col gap-1">
        <img src={iconSrc} alt="" className="size-8.5" />
        <div className="text-[32px] font-bold leading-11 tracking-[0.0025em] text-foreground">
          {value}
        </div>
        <div className="text-sm font-normal leading-5 tracking-[0.0025em] text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
};
