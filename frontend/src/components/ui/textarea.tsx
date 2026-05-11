import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "w-full rounded-[8px] border border-line bg-transparent px-4 py-3.5 font-alexandria text-sm font-normal leading-5 tracking-[0.0025em] text-ink transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-15 max-h-100",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

type FloatingLabelTextareaProps = React.ComponentProps<typeof Textarea> & {
  label: string;
  disabled?: boolean;
  error?: string;
};

// Floating label textarea component
function FloatingLabelTextarea({
  id,
  label,
  className,
  disabled,
  rows,
  error,
  ...props
}: FloatingLabelTextareaProps) {
  return (
    <div className="relative">
      <Textarea
        id={id}
        disabled={disabled}
        rows={rows}
        placeholder=" "
        className={cn(
          "peer text-ink-heading placeholder:text-ink-muted focus-visible:outline-none",
          className
        )}
        {...props}
      />

      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-background px-1 font-alexandria text-sm font-medium leading-5 text-ink-muted transition-all",
          "peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-5 peer-placeholder-shown:text-ink-muted",
          "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:leading-4",
          "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:leading-4",
          "peer-focus:bg-background peer-focus:px-1 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1",
          disabled ? "opacity-50" : null
        )}
      >
        {label}
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export { Textarea, FloatingLabelTextarea };
