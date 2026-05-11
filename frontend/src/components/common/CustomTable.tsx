import { Fragment, useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, SearchX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { type IPaginationProps, type ISortProps } from "@/types/common.interface";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface IProps<T> extends IPaginationProps, ISortProps {
  headers: Column<T>[];
  listData: T[];
  className?: string;
  tableClassName?: string;
  pagination?: boolean;
  serverSide?: boolean;
  notFoundText?: string;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T, index: number) => string | number;
  rowClassName?: (row: T, index: number) => string | undefined;
  renderExpandedRow?: (row: T) => React.ReactNode;
  isRowExpanded?: (row: T) => boolean;
  expandedRowClassName?: string;
  expandedRowCellClassName?: string;
    headerWrapperClassName?: string;
}

const CustomTable = <T,>({
  headers,
  listData,
  className,
  tableClassName,
  pagination = false,
  totalItems: externalTotalItems,
  currentPage: externalCurrentPage = 1,
  rowsPerPage: externalRowsPerPage = 10,
  onPageChange: externalOnPageChange,
  onRowsPerPageChange: externalOnRowsPerPageChange,
  onSort,
  sortBy,
  sortOrder,
  serverSide = false,
  notFoundText,
  onRowClick,
  getRowId,
  rowClassName,
  renderExpandedRow,
  isRowExpanded,
  expandedRowClassName,
  expandedRowCellClassName,
  headerWrapperClassName
}: IProps<T>) => {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);

  const currentPage = serverSide ? externalCurrentPage : internalCurrentPage;
  const rowsPerPage = serverSide ? externalRowsPerPage : internalRowsPerPage;
  const totalItems = serverSide
    ? externalTotalItems || listData.length
    : listData.length;

  const handlePageChange = (page: number) => {
    if (serverSide && externalOnPageChange) {
      externalOnPageChange(page);
    } else if (!serverSide) {
      setInternalCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    if (serverSide && externalOnRowsPerPageChange) {
      externalOnRowsPerPageChange(newRowsPerPage);
    } else if (!serverSide) {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalCurrentPage(1);
    }
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newOrder = sortBy === key && sortOrder === "ASC" ? "DESC" : "ASC";
    onSort(key, newOrder);
  };

  const paginatedData = useMemo(() => {
    if (serverSide) {
      return listData;
    } else {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return listData.slice(startIndex, endIndex);
    }
  }, [listData, currentPage, rowsPerPage, serverSide]);

  return (
    <div className={cn("flex flex-col", className)}>
      <Table className={tableClassName}>
        <TableHeader className={cn(
    "bg-grey-50/50", // default
    headerWrapperClassName // override from parent
  )}>
          <TableRow className="hover:bg-transparent">
            {headers.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "font-semibold text-sm text-ink-disabled",
                  col.sortable &&
                    "group cursor-pointer select-none hover:text-primary transition-colors",
                  col.headerClassName ?? col.className
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.sortable ? (
                  <div className="flex items-center gap-2">
                    {col.header}
                    <div className="text-neutral-400">
                      {sortBy === col.key ? (
                        sortOrder === "ASC" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-center py-20">
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground animate-in fade-in duration-500">
                  <div className="rounded-full bg-neutral-100 p-4">
                    <SearchX className="h-10 w-10 text-neutral-300" />
                  </div>
                  <span className="font-regular text-ink">
                    {notFoundText || "No records found matching your selection"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, idx) => {
              const rowKey = getRowId ? getRowId(row, idx) : ((row as { id?: string | number }).id ?? idx);
              const expanded = Boolean(renderExpandedRow && isRowExpanded?.(row));

              return (
                <Fragment key={rowKey}>
                  <TableRow
                    className={cn(
                      "hover:bg-neutral-50/50 transition-colors border-b border-neutral-100 last:border-0",
                      onRowClick && "cursor-pointer",
                      rowClassName?.(row, idx),
                    )}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {headers.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "font-regular text-sm font-alexandria leading-5 tracking-[0.01em] text-ink py-3",
                          col.className,
                          col.cellClassName,
                        )}
                      >
                        {col.render
                          ? row && col.render(row)
                          : ((row as Record<string, unknown>)?.[col.key] as React.ReactNode ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>

                  {expanded ? (
                    <TableRow
                      className={cn(
                        "hover:bg-transparent",
                        expandedRowClassName,
                      )}
                    >
                      <TableCell
                        colSpan={headers.length}
                        className={cn("p-0", expandedRowCellClassName)}
                      >
                        {renderExpandedRow?.(row)}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && (
        <Pagination
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          currentPage={currentPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default CustomTable;
