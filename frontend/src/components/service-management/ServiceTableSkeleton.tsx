import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ServiceTableSkeleton = ({ rowCount = 5 }: { rowCount?: number }) => {
  return (
    <div className="overflow-hidden bg-card mb-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-25 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
              Id
            </TableHead>
            <TableHead className="min-w-60 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
              Name
            </TableHead>
            <TableHead className="min-w-55 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
              Sub Category
            </TableHead>
            <TableHead className="w-30 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
              Price
            </TableHead>
            <TableHead className="w-35 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
              Commission
            </TableHead>
            <TableHead className="w-40 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs text-center">
              Availability
            </TableHead>
            <TableHead className="w-22 text-right font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="h-16">
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell className="h-16">
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell className="h-16">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="h-16">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="h-16">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="h-16">
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              </TableCell>
              <TableCell className="h-16 text-right">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
