import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const DrawerContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animateOpen: boolean;
  setRender: (val: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
  animateOpen: false,
  setRender: () => {},
});

export function Drawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [shouldRender, setRender] = React.useState(open);
  const [animateOpen, setAnimateOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateOpen(true);
        });
      });
    } else {
      setAnimateOpen(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!shouldRender) return null;

  return (
    <DrawerContext.Provider
      value={{ open, onOpenChange, animateOpen, setRender }}
    >
      {typeof document !== "undefined"
        ? createPortal(children, document.body)
        : children}
    </DrawerContext.Provider>
  );
}

export const DrawerOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { onOpenChange, animateOpen } = React.useContext(DrawerContext);
  return (
    <div
      ref={ref}
      onClick={() => onOpenChange(false)}
      className={cn(
        "fixed inset-0  bg-black/40 transition-opacity duration-200",
        animateOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      {...props}
    />
  );
});
DrawerOverlay.displayName = "DrawerOverlay";

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  anchor?: "left" | "right";
}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(({ className, children, anchor = "right", ...props }, ref) => {
  const { open, animateOpen, setRender } = React.useContext(DrawerContext);
  return (
    <>
      <DrawerOverlay />
      <div
        ref={ref}
        onTransitionEnd={() => {
          if (!open) setRender(false);
        }}
        className={cn(
          "fixed top-0 bottom-0 flex flex-col bg-white h-full transition-transform duration-300 ease-in-out font-alexandria",
          "shadow-[-8px_0px_40px_0px_rgba(0,0,0,0.12)]",
          anchor === "right" ? "right-0" : "left-0",
          anchor === "right"
            ? animateOpen
              ? "translate-x-0"
              : "translate-x-full"
            : animateOpen
            ? "translate-x-0"
            : "-translate-x-full",
          "w-full max-w-[400px]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-row items-center justify-between px-6 py-4 shrink-0",
      className
    )}
    {...props}
  />
));
DrawerHeader.displayName = "DrawerHeader";

export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-base font-bold text-ink-slate m-0", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

export const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 overflow-y-auto overflow-x-hidden w-full relative",
      className
    )}
    {...props}
  />
));
DrawerBody.displayName = "DrawerBody";

export const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 bg-white sticky bottom-0 shrink-0", className)}
    {...props}
  />
));
DrawerFooter.displayName = "DrawerFooter";
