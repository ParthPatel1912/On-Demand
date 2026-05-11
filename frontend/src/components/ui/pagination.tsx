import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type IPaginationProps } from "@/types/common.interface";

const Pagination = ({
  className,
  rowsPerPage = 10,
  totalItems = 0,
  currentPage = 1,
  onRowsPerPageChange,
  onPageChange,
  ...props
}: React.ComponentProps<"nav"> & IPaginationProps) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn(
        "mx-auto flex w-full items-center justify-end overflow-auto py-4",
        className
      )}
      {...props}
    >
      <div className="flex flex-row justify-end sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <p className="text-xs sm:text-sm font-medium leading-5 text-ink-muted whitespace-nowrap">
            Rows per page:
          </p>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(value) =>
              onRowsPerPageChange && onRowsPerPageChange(Number(value))
            }
          >
            <SelectTrigger className="h-7 sm:h-8 p-0 gap-1 font-medium sm:gap-1.5 border-none text-xs sm:text-sm cursor-pointer">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-0">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={String(pageSize)}
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-xs sm:text-sm font-medium leading-5 tracking-[0.25%] text-ink-muted whitespace-nowrap">
          {totalItems > 0
            ? `${startItem}-${endItem} of ${totalItems}`
            : `0-0 of 0`}
        </div>
        <div className="flex items-center justify-center sm:justify-start">
          <PaginationPrevious
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          <PaginationNext
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          />
        </div>
      </div>
    </nav>
  );
};
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  onClick,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    aria-label="Go to previous page"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "default",
      }),
      "gap-1 p-2 sm:p-2.5 min-h-9 sm:min-h-10",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
  </button>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  onClick,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    aria-label="Go to next page"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "default",
      }),
      "gap-1 p-2 mr-2 sm:p-2.5 min-h-9 sm:min-h-10",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </button>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
