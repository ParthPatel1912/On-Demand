import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { iconMagnifyingGlass } from "@/assets";
import type { HomeService } from "@/api/homeServices";
import { formatPrice, searchServices } from "@/api/homeServices";
import { HOME_TEXT } from "@/constants/home.text";

interface IProps {
  placeholder?: string;
  className?: string;
  suggestionsEnabled?: boolean;
  maxSuggestions?: number;
  onSelectSuggestion?: (service: HomeService) => void;
}

export const SearchBar = ({
  placeholder = HOME_TEXT.searchPlaceholder,
  className,
  suggestionsEnabled = false,
  maxSuggestions = 5,
  onSelectSuggestion,
}: IProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<HomeService[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!suggestionsEnabled) return;
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const data = await searchServices(trimmedQuery, maxSuggestions);
        if (!cancelled) setSuggestions(data.slice(0, maxSuggestions));
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [maxSuggestions, suggestionsEnabled, trimmedQuery]);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
      setActiveIndex(-1);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, []);

  const showDropdown = suggestionsEnabled && open && Boolean(trimmedQuery);

  return (
    <div ref={containerRef} className="relative w-full max-w-129.25">
      <form
        className={cn(
          "flex h-19 w-full items-center gap-4 rounded-[60px] border-2 border-border bg-background pl-6 pr-3",
          className
        )}
        onSubmit={(e) => {
          e.preventDefault();
          if (suggestionsEnabled) setOpen(true);
        }}
      >
        <img src={iconMagnifyingGlass} alt="" className="size-6" />
        <Input
          name="q"
          value={query}
          placeholder={placeholder}
          className="h-10 flex-1 border-0 bg-transparent p-0 font-montserrat text-md leading-6 text-muted-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
          autoComplete="off"
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            if (suggestionsEnabled) setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (suggestionsEnabled) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!suggestionsEnabled) return;
            if (e.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
              return;
            }

            if (!open) return;
            if (!suggestions.length) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) => {
                const next = Math.min(prev + 1, suggestions.length - 1);
                return next;
              });
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter") {
              if (activeIndex >= 0 && activeIndex < suggestions.length) {
                e.preventDefault();
                const service = suggestions[activeIndex];
                onSelectSuggestion?.(service);
                setOpen(false);
                setQuery("");
                setSuggestions([]);
                setActiveIndex(-1);
              }
            }
          }}
        />
        <Button
          type="submit"
          className="h-13.5 rounded-[40px] px-6 text-sm font-bold leading-5"
        >
          {HOME_TEXT.searchBtn}
        </Button>
      </form>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-3xl border-2 border-border bg-background shadow-lg">
          {loading ? (
            <div className="px-5 py-4 text-sm leading-5 text-muted-foreground">
              {HOME_TEXT.searching}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-5 py-4 text-sm leading-5 text-muted-foreground">
              {HOME_TEXT.noResults}
            </div>
          ) : (
            suggestions.slice(0, maxSuggestions).map((service, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={service.id}
                  type="button"
                  className={cn(
                    "flex cursor-pointer w-full items-center justify-between gap-4 px-5 py-4 text-left",
                    active ? "bg-primary/10" : "hover:bg-primary/5"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onSelectSuggestion?.(service);
                    setOpen(false);
                    setQuery("");
                    setSuggestions([]);
                    setActiveIndex(-1);
                  }}
                >
                  <span className="text-sm font-medium leading-5 text-foreground">
                    {service.name}
                  </span>
                  <span className="shrink-0 text-sm font-semibold leading-5 text-foreground">
                    {formatPrice(service.price)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
