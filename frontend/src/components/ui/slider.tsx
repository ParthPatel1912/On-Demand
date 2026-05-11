import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    formatLabel?: (value: number) => string
  }
>(({ className, formatLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center pb-8",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-visible rounded-full bg-grey-200">
      <SliderPrimitive.Range className="absolute h-full bg-primary cursor-pointer" />
    </SliderPrimitive.Track>
    {props.value?.map((val, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className="relative block h-4 w-4 rounded-full border-2 border-white bg-primary cursor-pointer ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md"
      >
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center max-w-[90vw]">
          <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-[5px] border-b-ink-muted" />
          <div className="bg-ink-muted text-white text-[11px] font-bold px-2 rounded-[20px] whitespace-nowrap min-w-11 text-center shadow-lg">
            {formatLabel ? formatLabel(val) : `$${val}`}
          </div>
        </div>
      </SliderPrimitive.Thumb>
    ))}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
