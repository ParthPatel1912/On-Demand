import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ICommonPopupProps } from "@/types/common.interface";

const CommonPopup = ({
  open,
  onOpenChange,
  title,
  children,
  className,
  footerClass,
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  loading = false,
  isSaveDisabled = false,
  footer,
  inset = true,
  bodyClassName,
  hideHeader = false,
  hideFooter = false,
  variant = "full",
  onlyOneButton = false,
}: ICommonPopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bg-white p-0 overflow-hidden rounded-xl flex flex-col gap-0 border-none outline-none",
          className
        )}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {/* HEADER */}
        {!hideHeader && (
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-lg font-bold text-ink leading-tight text-left">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}

        {/* BODY */}
        <DialogDescription asChild>
          <div className={cn(
            "flex-1 overflow-y-auto min-h-0 space-y-5",
            inset ? "px-6 py-4" : "p-0",
            bodyClassName
          )}>
            {children}
          </div>
        </DialogDescription>

        {/* FOOTER */}
        {!hideFooter && (
          <DialogFooter className={cn("p-6 pt-2")}>
            {footer ? (
              footer
            ) : (
              <div className={cn(
                "flex items-center gap-3",
                footerClass
              )}>
                {!onlyOneButton && (
                  <Button
                    type="button"
                    variant="secondary"
                    className={cn(
                      "h-12 flex-1 rounded-xl text-ink font-bold",
                      variant === "small" && "h-10 px-8 w-27 rounded-full"
                    )}
                    onClick={onCancel || (() => onOpenChange(false))}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  type="button"
                  className={cn(
                    "h-12 flex-1 rounded-xl text-white font-bold",
                    variant === "small" && "h-10 px-8 w-27 rounded-full",
                    saveText === "Delete"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-primary hover:bg-primary-hover"
                  )}
                  onClick={onSave}
                  disabled={loading || isSaveDisabled}
                >
                  {loading ? "Loading..." : saveText}
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommonPopup;
