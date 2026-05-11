import { useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type IProps = PropsWithChildren<{
  className?: string;
  /**
   * How far to scroll when clicking the arrows.
   * Defaults to the visible width of the container.
   */
  scrollBy?: number;
  /**
   * Position class for navigation buttons
   * Defaults to "top-1/3 -translate-y-1/2"
   */
  buttonPosition?: string;
}>;

export const HorizontalCarousel = ({
  children,
  className,
  scrollBy,
  buttonPosition = "top-1/3 -translate-y-1/2",
}: IProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScrollLeft = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScrollLeft - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();

    const handler = () => updateScrollButtons();
    el.addEventListener("scroll", handler);
    window.addEventListener("resize", handler);

    return () => {
      el.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const distance = scrollBy ?? el.clientWidth;
    const delta = direction === "left" ? -distance : distance;

    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className={cn(
          "absolute -left-5 z-10 -translate-y-1/2 rounded-full border-2 border-outlined-border bg-background shadow-sm disabled:opacity-40 hover:bg-background",
          "-left-3 sm:-left-5",
          buttonPosition,
        )}
        onClick={() => handleScroll("left")}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
      >
        <ArrowLeft className="size-5 text-primary" />
      </Button>

      <div
        ref={scrollRef}
        className={cn(
          "no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-12",
          "snap-x snap-mandatory",
        )}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div key={index} className="snap-start shrink-0">
                {child}
              </div>
            ))
          : children}
      </div>

      <Button
        type="button"
        size="icon"
        variant="outline"
        className={cn(
          "absolute -right-5 z-10 -translate-y-1/2 rounded-full border-2 border-outlined-border bg-background shadow-sm disabled:opacity-40 hover:bg-background",
          "-right-3 sm:-right-5",
          buttonPosition,
        )}
        onClick={() => handleScroll("right")}
        disabled={!canScrollRight}
        aria-label="Scroll right"
      >
        <ArrowRight className="size-5 text-primary" />
      </Button>
    </div>
  );
};
