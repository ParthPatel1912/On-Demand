import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-[8px] border border-line bg-transparent px-4 py-3.5 font-alexandria text-sm font-normal leading-5 tracking-[0.0025em] text-ink shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          type === "number"
            ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            : null,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

type FloatingLabelInputProps = React.ComponentProps<typeof Input> & {
  label: string;
  rightAddon?: React.ReactNode;
  rightAddonClassName?: string;
  type?: string;
  error?: string;
};

function FloatingLabelInput({
  id,
  label,
  rightAddon,
  className,
  disabled,
  rightAddonClassName,
  type,
  error,
  ...props
}: FloatingLabelInputProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          rightAddon
            ? "relative flex w-full rounded-[8px] border border-line bg-transparent transition-colors"
            : "relative",
        )}
      >
        <Input
          id={id}
          disabled={disabled}
          type={type ? type : "text"}
          className={cn(
            "peer text-ink-heading placeholder:text-transparent focus:placeholder:text-ink-muted",
            rightAddon
              ? "flex-1 rounded-[8px] border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              : null,
            className,
          )}
          {...props}
          placeholder={props.placeholder || " "}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-background px-1 font-alexandria text-sm font-medium leading-5 text-ink-muted transition-all",
            "peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:leading-5 peer-placeholder-shown:text-ink-muted",
            "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:leading-4",
            "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:leading-4",
            "peer-focus:bg-background peer-focus:px-1 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1",
            disabled ? "opacity-50" : null,
          )}
        >
          {label}
        </label>
        {rightAddon ? (
          <div
            className={`flex min-w-10.25 items-center justify-center gap-2.5 rounded-r-[8px] border-line bg-surface-subtle px-4 text-sm font-medium leading-5 tracking-[0.001em] text-ink ${rightAddonClassName}`}
          >
            {rightAddon}
          </div>
        ) : null}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export { FloatingLabelInput };
