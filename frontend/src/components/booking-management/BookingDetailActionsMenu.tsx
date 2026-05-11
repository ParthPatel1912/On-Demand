import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  EllipsisVertical,
  SquarePlus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FloatingLabelSelect, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BookingStatus,
  type BookingDetail,
  type Expert,
} from "@/types/bookingManagement.interface";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { bookingExpertChange } from "@/assets";
import { getExpertsByServiceType } from "@/api/adminBookingManagement";
import type { ExpertListItem } from "@/api/adminBookingManagement";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import DeleteConfirmPopup from "../common/DeleteConfirmPopup";
import ConfirmPopup from "../common/ConfirmPopup";
import { getInitialsName } from "@/utils";

interface IProps {
  detail: BookingDetail;
  serviceTypeOptions: string[];
  onComplete: () => void;
  onCancel: (reason: string) => void;
  onDelete: () => void;
  onChangeExpert: (servicePartnerId: number) => void;
}

function getRoleLabel(serviceType: string) {
  const normalized = serviceType.trim().toLowerCase();
  if (normalized === "cleaning") return "House Cleaner";
  if (normalized === "repair") return "Repair Expert";
  return `${serviceType} Expert`;
}

function ExpertsSkeleton() {
  return (
    <div className="rounded-[14px] border border-line divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-12 w-12 rounded-[8px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function BookingDetailActionsMenu({
  detail,
  serviceTypeOptions,
  onComplete,
  onCancel,
  onDelete,
  onChangeExpert,
}: IProps) {
  const [isChangeExpertOpen, setIsChangeExpertOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState<string>("");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isExpertsLoading, setIsExpertsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const status = detail.status.toLowerCase();
  const isDisabled =
    status === BookingStatus.CANCELLED.toLowerCase() ||
    status === BookingStatus.COMPLETED.toLowerCase();

  const availableExperts = useMemo(() => {
    const list = experts;
    return detail.assignedExpertId
      ? list.filter((e) => e.id !== detail.assignedExpertId)
      : list;
  }, [detail.assignedExpertId, experts]);

  const selectedExpert = useMemo(() => {
    const id = Number(selectedExpertId);
    if (!Number.isFinite(id)) return undefined;
    return availableExperts.find((e) => e.id === id);
  }, [availableExperts, selectedExpertId]);

  const fetchExperts = useCallback(async () => {
    if (!detail.bookingId) return;
    setIsExpertsLoading(true);
    try {
      const res = await getExpertsByServiceType(detail.bookingId);
      const role = getRoleLabel(detail.serviceType);
      const mapped: Expert[] = res.data.map((e: ExpertListItem) => ({
        id: e.id,
        name: e.name,
        avatar: e.avatar,
        role,
        verified: e.verified,
      }));
      // stable sorting for consistent UI
      mapped.sort((a, b) => a.name.localeCompare(b.name));
      setExperts(mapped);
      const next = mapped.find((e) =>
        detail.assignedExpertId ? e.id !== detail.assignedExpertId : true,
      );
      setSelectedExpertId(next ? String(next.id) : "");
    } catch {
      setExperts([]);
      setSelectedExpertId("");
    } finally {
      setIsExpertsLoading(false);
    }
  }, [detail.assignedExpertId, detail.serviceType]);

  useEffect(() => {
    if (!isChangeExpertOpen) return;
    void fetchExperts();
  }, [isChangeExpertOpen, fetchExperts]);

  const handleCancelSubmit = () => {
    const reason = cancelReason.trim();

    if (!reason) {
      setCancelReasonError("Cancellation reason is required");
      return;
    }

    onCancel(reason);
    setIsCancelOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface-card"
            aria-label="Open detail row actions"
          >
            <EllipsisVertical className="h-5! w-5!" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-50 font-alexandria rounded-[14px] border border-line bg-white p-2 shadow-[0px_10px_30px_rgba(0,0,0,0.15)]"
        >
          <DropdownMenuItem
            className="px-3 py-2 text-sm font-normal text-ink focus:bg-surface-card rounded-xl"
            disabled={isDisabled}
            onSelect={() => {
              setIsChangeExpertOpen(true);
            }}
          >
            {detail.assignedExpertId ? (
              <img
                src={bookingExpertChange}
                alt="booking expert change"
                className="h-5! w-5!"
              />
            ) : (
              <SquarePlus className="h-5! w-5!" />
            )}
            {detail.assignedExpertId ? "Change Expert" : "Assign Expert"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="px-3 py-2 text-sm font-medium text-ink focus:bg-surface-card rounded-xl"
            onSelect={() => setIsCompleteOpen(true)}
            disabled={isDisabled}
          >
            <CheckCircle2 className="h-5! w-5! text-ink-muted" />
            Complete Booking
          </DropdownMenuItem>
          <DropdownMenuItem
            className="px-3 py-2 text-sm font-medium text-ink focus:bg-surface-card rounded-xl"
            onSelect={() => {
              setCancelReason(detail.cancellationReason ?? "");
              setCancelReasonError("");
              setIsCancelOpen(true);
            }}
            disabled={isDisabled}
          >
            <X className="h-5! w-5! text-ink-muted" />
            Cancel Booking
          </DropdownMenuItem>
          <DropdownMenuItem
            className="px-3 py-2 text-sm font-medium text-ink focus:bg-surface-card rounded-xl"
            onSelect={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-5! w-5! text-ink-muted" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-125 max-w-125 rounded-[20px] p-6 pt-0 gap-10 font-alexandria!">
          <div className="pt-15 flex flex-col items-center text-center gap-6">
            <AlertTriangle
              className="h-8 w-8 text-amber-500"
              strokeWidth={2.5}
            />

            <div className="space-y-2">
              <h3 className="text-md font-semibold text-ink text-center leading-6 max-w-87.5">
                Are you sure you want to cancel this booking?
              </h3>
            </div>
            <div className="w-full">
              <p className="text-[15px] font-medium text-ink-muted max-w-87.5 text-left self-start">
                Please enter the reason for cancelling the booking request.
              </p>

              {/* Textarea */}
              <div className="w-full mt-3">
                <Textarea
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (cancelReasonError) setCancelReasonError("");
                  }}
                  placeholder="Type Here..."
                  className="min-h-32 resize-none rounded-xl border-line focus-visible:ring-1 focus-visible:ring-primary text-sm font-medium placeholder:text-ink-disabled p-4"
                />
                {cancelReasonError ? (
                  <p className="mt-2 text-left text-xs font-medium text-red-500">
                    {cancelReasonError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row gap-8 pt-0 justify-between sm:justify-between sm:space-x-0">
            <Button
              type="button"
              variant="secondary"
              className="h-12 flex-1 rounded-[8px] font-bold text-sm"
              onClick={() => setIsCancelOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-12 flex-1 rounded-[8px] font-bold text-sm"
              onClick={handleCancelSubmit}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangeExpertOpen} onOpenChange={setIsChangeExpertOpen}>
        <DialogContent className="w-full max-w-150 rounded-2xl p-6 pt-0 gap-8 font-alexandria!">
          <DialogHeader className="pt-6">
            <DialogTitle className="text-lg font-bold text-ink leading-tight text-left">
              {detail.assignedExpertId ? "Change Expert" : "Assign Expert"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {detail.assignedExpertId && (
              <div className="space-y-3">
                <div className="bg-primary/5 rounded-xl p-4">
                  <span className="text-sm font-semibold text-ink-muted">
                    Assigned Expert
                  </span>
                  <div className="flex gap-3 items-center mt-2.5">
                    <Avatar className="h-10 w-10 rounded-lg">
                      {detail.assignedExpertAvatar && (
                        <AvatarImage
                          src={detail.assignedExpertAvatar}
                          alt={detail.assignedExpert}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-primary-soft text-xs text-primary">
                        {getInitialsName(detail.assignedExpert)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-medium text-ink">
                        {detail.assignedExpert}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-normal text-ink-muted truncate">
                          {getRoleLabel(detail.serviceType)}
                        </span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full bg-ink-subtle`}
                        />
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                          <CheckCircle2
                            className="h-4 w-4"
                            stroke="currentColor"
                            strokeWidth={2}
                          />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-full">
              <FloatingLabelSelect
                id="change-expert-service-type"
                label="Service Type"
                disabled
                value={detail.serviceType}
              >
                {(serviceTypeOptions.length
                  ? serviceTypeOptions
                  : [detail.serviceType]
                )
                  .filter((option) => option && option.trim() !== "")
                  .map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
              </FloatingLabelSelect>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-muted">
                Available Expert
              </p>

              <div className="mt-3 max-h-90 overflow-auto rounded-[14px] bg-white">
                {isExpertsLoading ? (
                  <ExpertsSkeleton />
                ) : availableExperts.length === 0 ? (
                  <div className="rounded-[14px] border border-line p-6 text-ink-muted">
                    No experts available for this service type.
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedExpertId}
                    onValueChange={setSelectedExpertId}
                    className="rounded-[14px] border border-line divide-y divide-line-soft"
                  >
                    {availableExperts.map((expert) => (
                      <label
                        htmlFor={expert.id.toString()}
                        className={cn(
                          "flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors",
                          selectedExpertId === expert.id.toString() &&
                            "bg-primary/2",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg">
                            {expert.avatar && (
                              <AvatarImage
                                src={expert.avatar}
                                alt={expert.name}
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback className="bg-primary-soft text-xs text-primary">
                              {getInitialsName(expert.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-base font-medium text-ink truncate">
                              {expert.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-normal text-ink-muted truncate">
                                {expert.role}
                              </span>
                              <span
                                className={`w-1.5 h-1.5 rounded-full bg-ink-subtle`}
                              />
                              {expert.verified && (
                                <span className="flex items-center gap-1 text-xs font-bold text-primary">
                                  <CheckCircle2
                                    className="h-4 w-4"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  />
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <RadioGroupItem
                          value={String(expert.id)}
                          className="h-5 w-5 flex items-center justify-center rounded-full border-2 border-line data-[state=checked]:border-primary"
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-primary scale-0 data-[state=checked]:scale-100 transition-transform" />
                        </RadioGroupItem>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              className="min-w-37.5 rounded-[14px]"
              onClick={() => setIsChangeExpertOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="min-w-37.5 rounded-[14px]"
              onClick={() => {
                if (!selectedExpert) return;
                onChangeExpert(selectedExpert.id);
                setIsChangeExpertOpen(false);
              }}
              disabled={!selectedExpert || isExpertsLoading}
            >
              Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmPopup
        open={isCompleteOpen}
        title="Complete Booking"
        message={`Are you sure you want to mark booking #${detail.bookingId} as completed?`}
        saveText="Complete"
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={async () => onComplete()}
      />

      <DeleteConfirmPopup
        open={isDeleteOpen}
        item={{ name: `Booking #${detail.bookingId}` }}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => onDelete()}
      />
    </>
  );
}
