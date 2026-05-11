import { useCallback, useEffect, useState } from "react";
import { ServiceTableSkeleton } from "./ServiceTableSkeleton";
import { useAuth } from "@/hooks/useAuth";

import axiosInstance from "@/helper/axiosInstance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ActionMenu } from "@/components/common/ActionMenu";
import ConfirmPopup from "@/components/common/ConfirmPopup";
import { Pagination } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/routes/config";
import type {
  ServiceManagementList,
  ServiceManagement,
} from "@/types/masterData.interface";
import { SERVICE_MANAGEMENT_TEXT } from "@/constants/serviceManagement.text";

interface IProps {
  readonly services: ServiceManagementList | null;
  readonly loading?: boolean;
  readonly page?: number;
  readonly limit?: number;
  readonly onPageChange?: (page: number) => void;
  readonly onLimitChange?: (limit: number) => void;
  readonly onEdit?: (service: ServiceManagement) => void;
  readonly onDelete?: (service: ServiceManagement) => void;
}

export const ServiceTable = ({
  services,
  loading,
  page = 1,
  limit = 10,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}: Readonly<IProps>) => {
  const { isPartner, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const handleRowClick = (service: ServiceManagement) => {
    if (isPartner) {
      navigate(APP_ROUTES.SERVICE_PARTNER_SERVICE_DETAILS.replace(":serviceId", service.id.toString()));
    } else {
      navigate(APP_ROUTES.ADMIN_SERVICE_DETAILS.replace(":serviceId", service.id.toString()));
    }
  };

  const [availabilityById, setAvailabilityById] = useState<
    Record<number, boolean>
  >({});
  const [pendingAvailabilityToggle, setPendingAvailabilityToggle] = useState<{
    id: number;
    name: string;
    nextAvailability: boolean;
  } | null>(null);

  useEffect(() => {
    if (!services) return;
    setAvailabilityById((prev) => {
      const next: Record<number, boolean> = { ...prev };
      for (const service of services.data) {
        if (next[service.id] === undefined)
          next[service.id] = service.availability;
      }
      return next;
    });
  }, [services]);

  const handleToggleAvailability = useCallback(
    async (id: number, checked: boolean) => {
      // Optimistic update
      setAvailabilityById((prev) => ({ ...prev, [id]: checked }));
      try {
        await axiosInstance.patch(`/services/${id}/availability`, {
          availability: checked,
        });
      } catch (err) {
        console.error("Failed to update availability:", err);
        // Roll back on failure
        setAvailabilityById((prev) => ({ ...prev, [id]: !checked }));
      }
    },
    [],
  );

  const items = services?.data ?? [];

  return (
    <>
      {/* Redundant toolbar removed here as CategorySection handles it */}

      {loading ? (
        <ServiceTableSkeleton rowCount={limit} />
      ) : (
        <div className="overflow-hidden bg-card mb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-25 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
                  {SERVICE_MANAGEMENT_TEXT.tableId}
                </TableHead>
                <TableHead className="min-w-60 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
                  {SERVICE_MANAGEMENT_TEXT.tableName}
                </TableHead>
                <TableHead className="min-w-55 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
                  {SERVICE_MANAGEMENT_TEXT.tableSubCategory}
                </TableHead>
                <TableHead className="w-30 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
                  {SERVICE_MANAGEMENT_TEXT.tablePrice}
                </TableHead>
                <TableHead className="w-35 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
                  {SERVICE_MANAGEMENT_TEXT.tableCommission}
                </TableHead>
                <TableHead className="w-40 font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs text-center">
                  {SERVICE_MANAGEMENT_TEXT.tableAvailability}
                </TableHead>
                <TableHead className="w-22 text-center font-bold text-ink-disabled bg-transparent border-y border-line h-12 text-xs">
                  {SERVICE_MANAGEMENT_TEXT.tableAction}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {SERVICE_MANAGEMENT_TEXT.tableNoServices}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((service) => (
                  <TableRow
                    key={service.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(service)}
                  >
                    <TableCell className="font-medium text-ink">
                      {service.id}
                    </TableCell>
                    <TableCell className="font-medium text-ink">
                      {service.name}
                    </TableCell>
                    <TableCell className="font-medium text-ink">
                      {service.subCategory?.name}
                    </TableCell>
                    <TableCell className="font-medium text-ink">
                      ${service.price}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-ink">
                        {service.commission}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-3">
                        <Switch
                          checked={availabilityById[service.id] ?? false}
                          disabled={!isAdmin && service.createdBy !== (user as any)?.id}
                          onCheckedChange={(checked) => {
                            setPendingAvailabilityToggle({
                              id: service.id,
                              name: service.name,
                              nextAvailability: checked,
                            });
                          }}
                          className="data-[state=checked]:bg-primary disabled:opacity-50"
                          aria-label={`Toggle availability for ${service.name}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-center p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdmin || (isPartner && service.createdBy === (user as any)?.id) ? (
                        <ActionMenu
                          onEdit={() => onEdit?.(service)}
                          onDelete={() => onDelete?.(service)}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          className="h-8 w-8 hover:bg-neutral-100 rounded-full transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                          <MoreVertical className="h-4 w-4 text-ink-muted" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {services && services.pagination && (
        <Pagination
          currentPage={page}
          rowsPerPage={limit}
          totalItems={services.pagination.totalItems}
          onPageChange={onPageChange}
          onRowsPerPageChange={onLimitChange}
        />
      )}

      <ConfirmPopup
        open={!!pendingAvailabilityToggle}
        title={
          pendingAvailabilityToggle?.nextAvailability
            ? SERVICE_MANAGEMENT_TEXT.enableServiceTitle
            : SERVICE_MANAGEMENT_TEXT.disableServiceTitle
        }
        message={
          <>
            {SERVICE_MANAGEMENT_TEXT.confirmEnableDisableStart}
            {pendingAvailabilityToggle?.nextAvailability ? SERVICE_MANAGEMENT_TEXT.enableActionText : SERVICE_MANAGEMENT_TEXT.disableActionText}{" "}
            <b>"{pendingAvailabilityToggle?.name}"</b>?
          </>
        }
        saveText={
          pendingAvailabilityToggle?.nextAvailability ? SERVICE_MANAGEMENT_TEXT.enableBtn : SERVICE_MANAGEMENT_TEXT.disableBtn
        }
        onClose={() => setPendingAvailabilityToggle(null)}
        onConfirm={async () => {
          if (!pendingAvailabilityToggle) return;
          await handleToggleAvailability(
            pendingAvailabilityToggle.id,
            pendingAvailabilityToggle.nextAvailability,
          );
        }}
      />
    </>
  );
};
