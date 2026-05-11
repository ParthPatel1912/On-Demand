import { useState } from "react";
import { Eye, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { IServiceTypeSummary } from "@/types/user-management/partner.interface";
import { Button } from "@/components/ui/button";

interface JobPopoverProps {
  serviceTypes: IServiceTypeSummary[];
}

export const JobPopover = ({ serviceTypes }: JobPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!serviceTypes || serviceTypes.length === 0) return <span className="text-ink-muted">-</span>;

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 h-8 px-3 rounded-lg font-bold border-none transition-all duration-200",
              isOpen
                ? "bg-primary text-white hover:bg-primary/80 hover:text-white"
                : "text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary-deep"
            )}
          >
            <Eye className={cn("h-4 w-4", isOpen ? "text-white" : "text-primary")} strokeWidth={2.5} />
            View
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-fit min-w-48 p-3 bg-white rounded-xl border-line shadow-[0px_8px_24px_rgba(0,0,0,0.12)] z-100 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
              <div className="p-1 rounded-md bg-primary/10">
                <Info className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">
                Service categories ({serviceTypes.length})
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {serviceTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-colors group/item"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/item:bg-primary transition-colors" />
                  <span className="text-sm font-medium text-ink">
                    {type.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
