import * as React from "react";
import { Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { IProps } from "@/types/common.interface";

const FilterPopover = ({
  children,
  onFilter,
  onReset,
  open: controlledOpen,
  onOpenChange,
  className,
  title = "Filter",
  disableFilter = false,
  disableReset = false,
}: IProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleFilter = () => {
    onFilter?.();
    if (!onOpenChange) {
      setInternalOpen(false);
    }
  };

  const handleReset = () => {
    onReset?.();
    if (!onOpenChange) {
      setInternalOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 font-bold"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "fixed top-0 bottom-0 left-auto right-0 translate-x-0 translate-y-0 h-full w-87.5 sm:w-100 p-0 border-l border-line rounded-none shadow-[-10px_0_30px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-none m-0 [&>button]:hidden",
          className
        )}
      >
        <div className="flex flex-col h-full bg-white font-alexandria">
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 space-y-0">
            <DialogTitle className="text-lg font-bold text-ink-slate m-0">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-ink-disabled hover:bg-muted/50 rounded-full shrink-0"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="px-6 space-y-6">{children}</div>

          <div className="p-6">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleReset}
                className="flex-1"
                disabled={disableReset}
              >
                Reset
              </Button>
              <Button
                onClick={handleFilter}
                className="flex-1"
                disabled={disableFilter}
              >
                Filter
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FilterPopover;