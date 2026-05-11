import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Filter, X } from "lucide-react";
import type { IProps } from "@/types/common.interface";

export default function FilterDrawer({
  children,
  onFilter,
  onReset,
  open: controlledOpen,
  onOpenChange,
  className,
  title = "Filter",
  disableFilter = false,
  disableReset = false,
}: IProps) {
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
    <>
      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-2 font-bold"
        onClick={() => setOpen(true)}
      >
        <Filter className="h-4 w-4" />
        Filter
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent anchor={"right"} className={className}>
          <DrawerHeader>
            <DrawerTitle className="text-16px leading-5.5">{title}</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-ink-disabled hover:bg-muted/50 rounded-full shrink-0"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerHeader>

          <DrawerBody>
            <div className="px-6 py-2 space-y-6">{children}</div>

            <DrawerFooter>
              <div className="flex items-center gap-3">
                {handleReset && (
                  <Button
                    variant="secondary"
                    onClick={handleReset}
                    className="flex-1"
                    disabled={disableReset}
                  >
                    Reset
                  </Button>
                )}
                {handleFilter && (
                  <Button
                    onClick={handleFilter}
                    className="flex-1"
                    disabled={disableFilter}
                  >
                    Filter
                  </Button>
                )}
              </div>
            </DrawerFooter>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
