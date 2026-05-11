import React, { useState } from "react";
import { CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getInitialsName } from "@/utils";

interface ExpertHoverCardProps {
  expert: {
    name: string;
    role: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  children: React.ReactNode;
  onViewDetails?: () => void;
  onPhoneClick?: () => void;
}

export const ExpertHoverCard = ({
  expert,
  children,
  onViewDetails,
  onPhoneClick,
}: ExpertHoverCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="inline-block"
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className={cn(
          "w-50.5 p-0 bg-white rounded-lg border-line shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,0,0,0.1)]",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-3 pb-4 flex flex-col gap-3.5">
          {/* Expert Info Row */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[6px] border-none flex items-center justify-center text-lg overflow-hidden shrink-0">
              <Avatar className="h-8 w-8 rounded-[8px]">
                <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                <AvatarFallback className="bg-primary-soft text-xs text-primary">
                  {getInitialsName(expert.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-base font-medium text-ink leading-5 truncate">
                {expert.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-normal text-ink-muted leading-4 truncate">
                  {expert.role}
                </span>
                {expert.isVerified && (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" stroke="currentColor" strokeWidth={3} />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <Button
              className="h-10 flex-1 bg-primary hover:bg-primary-deep text-white text-sm font-bold rounded-lg px-4 border-none"
              disabled={expert.name === "Unknown"}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.();
              }}
            >
              View Details
            </Button>
            <Button
              variant="secondary"
              className="h-10 w-10 p-0 bg-primary/10 hover:bg-primary/15 text-primary rounded-lg border-none flex items-center justify-center shrink-0"
              disabled={expert.name === "Unknown"}
              onClick={(e) => {
                e.stopPropagation();
                onPhoneClick?.();
              }}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
