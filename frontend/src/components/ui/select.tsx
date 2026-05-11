import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp, X } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group flex w-full items-center justify-between whitespace-nowrap rounded-[8px] border border-line bg-transparent px-4 py-3.5 font-alexandria text-sm font-normal leading-5 tracking-[0.0025em] text-ink transition-colors data-placeholder:text-ink-muted focus:outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <span className="flex items-center">
        <ChevronDown className="h-5 w-5 opacity-50 transition-opacity group-data-[state=open]:hidden" />
        <ChevronUp className="hidden h-5 w-5 opacity-50 transition-opacity group-data-[state=open]:block" />
      </span>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    hideArrows?: boolean
  }
>(({ className, children, position = "popper", hideArrows, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-32 overflow-y-auto overflow-x-hidden rounded-[8px] border border-line bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      {!hideArrows && <SelectScrollUpButton />}
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
          "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      {!hideArrows && <SelectScrollDownButton />}
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none focus:bg-primary-soft data-[state=checked]:bg-primary-soft data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

type FloatingLabelSelectProps = React.ComponentProps<typeof Select> & {
  id: string
  label: string
  placeholder?: string
  triggerClassName?: string
  contentClassName?: string
  children: React.ReactNode
  error?: string
}

function FloatingLabelSelect({
  id,
  label,
  placeholder = ' ',
  triggerClassName,
  contentClassName,
  children,
  error,
  ...props
}: FloatingLabelSelectProps) {
  return (
    <>
      <div className="relative">
        <Select {...props}>
          <SelectTrigger
            id={id}
            className={cn('peer text-ink-heading cursor-pointer', triggerClassName)}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>{children}</SelectContent>
        </Select>

        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 top-0 z-10 -translate-y-1/2 bg-background px-1 font-alexandria text-xs font-medium leading-4 text-ink-muted transition-all",
            'peer-data-placeholder:top-1/2 peer-data-placeholder:-translate-y-1/2 peer-data-placeholder:bg-transparent peer-data-placeholder:px-0 peer-data-placeholder:text-sm peer-data-placeholder:leading-5',
            'peer-data-[state=open]:top-0 peer-data-[state=open]:-translate-y-1/2 peer-data-[state=open]:bg-background peer-data-[state=open]:px-1 peer-data-[state=open]:text-xs peer-data-[state=open]:leading-4',
          )}
        >
          {label}
        </label>

      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  )
}

export { FloatingLabelSelect }

// ---------------------------------------------------------------------------
// FloatingLabelMultiSelect
// ---------------------------------------------------------------------------

export type MultiSelectOption = {
  value: number
  label: string
}

type FloatingLabelMultiSelectProps = {
  id: string
  label: string
  options: MultiSelectOption[]
  value: number[]
  onChange: (value: number[]) => void
  error?: string
  placeholder?: string
  className?: string
  maxCount?: number
  hasMore?: boolean
  onLoadMore?: () => void
}

function FloatingLabelMultiSelect({
  id,
  label,
  options,
  value,
  onChange,
  error,
  placeholder = ' ',
  className,
  maxCount,
  hasMore,
  onLoadMore,
}: FloatingLabelMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setExpandChips(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleOption = (optValue: number) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  const removeOption = (optValue: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optValue))
  }

  const hasValue = value.length > 0
  const [expandChips, setExpandChips] = React.useState(false)

  const visibleValues = maxCount && !expandChips ? value.slice(0, maxCount) : value
  const hiddenCount = value.length - visibleValues.length

  return (
    <>
      <div className={cn('relative', className)} ref={containerRef}>
        {/* Trigger */}
        <button
          id={id}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'peer group flex min-h-12.5 w-full items-start flex-wrap gap-1.5 rounded-[8px] border border-line bg-transparent px-3 py-2.5 font-alexandria text-sm font-normal leading-5 text-ink transition-colors cursor-pointer',
            'focus:outline-none focus:ring-0',
            open && 'border-primary',
            error && 'border-red-500',
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex flex-wrap gap-1.5 flex-1 items-center">
            {hasValue ? (
              <>
                {visibleValues.map((v) => {
                  const opt = options.find((o) => o.value === v)
                  return opt ? (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-ink"
                    >
                      {opt.label}
                      <X
                        className="h-3 w-3 cursor-pointer text-ink-muted hover:text-primary"
                        onClick={(e) => removeOption(v, e)}
                      />
                    </span>
                  ) : null
                })}
                {hiddenCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-surface-base border border-line px-2.5 py-0.5 text-xs font-medium text-ink-muted cursor-pointer hover:bg-surface-faint transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandChips(true);
                    }}
                  >
                    +{hiddenCount} more
                  </span>
                )}
              </>
            ) : (
              <span className="text-ink-muted text-sm">{placeholder === ' ' ? '' : placeholder}</span>
            )}
          </span>
          <span className="ml-auto flex items-center self-center pl-1">
            {open ? (
              <ChevronUp className="h-5 w-5 opacity-50" />
            ) : (
              <ChevronDown className="h-5 w-5 opacity-50" />
            )}
          </span>
        </button>

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-4 z-10 bg-background px-1 font-alexandria text-xs font-medium leading-4 text-ink-muted transition-all',
            hasValue || open
              ? 'top-0 -translate-y-1/2'
              : 'top-1/2 -translate-y-1/2 bg-transparent px-0 text-sm leading-5',
          )}
        >
          {label}
        </label>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-[8px] border border-line bg-white shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-ink-muted italic">No options available</div>
            ) : (
              options.map((opt) => {
                const selected = value.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleOption(opt.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors border-b border-surface-faintAlt last:border-0',
                      selected ? 'bg-primary-soft text-ink' : 'hover:bg-primary-soft text-ink',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        selected ? 'bg-primary border-primary' : 'border-line',
                      )}
                    >
                      {selected && <Check className="h-3 w-3 text-white" />}
                    </span>
                    {opt.label}
                  </div>
                )
              })
            )}
            {hasMore && (
              <div
                className="px-3 py-2.5 text-sm text-center text-primary cursor-pointer hover:bg-primary-soft transition-colors font-medium border-t border-surface-faintAlt"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadMore?.();
                }}
              >
                Load more
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  )
}

export { FloatingLabelMultiSelect }