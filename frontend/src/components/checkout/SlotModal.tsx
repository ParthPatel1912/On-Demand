import { useMemo, useState, useCallback, memo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { convertStringDateToGBFormat } from "@/utils";
import { getAvailableSlots } from "@/api/booking";
import type { ISlotResponseDataType } from "@/types/service-checkout/serviceBooking.interface";
import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";

const SelectablePill = memo(
  ({
    label,
    isActive,
    onClick,
    disabled,
  }: {
    label: string;
    isActive: boolean;
    disabled: boolean;
    onClick: () => void;
  }) => (
    <Button
      variant="outline"
      disabled={disabled}
      className={cn(
        "rounded-full h-9 transition-colors text-xs leading-4 px-4 py-2 font-semibold",
        isActive
          ? "border-primary text-primary bg-primary-soft"
          : "border-line text-ink bg-white hover:bg-surface-faint",
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  ),
);

SelectablePill.displayName = "SelectablePill";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (slot: { date: string; time: string }) => void;
  initialDate?: string;
  initialTime?: string;
  duration?: number;
}

const SlotModal = ({
  isOpen,
  onClose,
  onSelect,
  initialDate,
  initialTime,
}: Readonly<IProps>) => {
  const [slotsData, setSlotsData] = useState<ISlotResponseDataType[]>([]);
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate ?? slotsData[0]?.date ?? "",
  );

  const selectedDateData = useMemo(
    () => slotsData.find((d) => d.date === selectedDate),
    [slotsData, selectedDate],
  );

  const [selectedTime, setSelectedTime] = useState<string>(
    initialTime ?? slotsData[0]?.times[0]?.time ?? "",
  );

  // Fetch API
  useEffect(() => {
    const serviceId = Number(globalThis.location.pathname.split("/")[2]);

    const fetchSlots = async () => {
      try {
        setLoading(true);
        const res = await getAvailableSlots(serviceId);
        if (res?.data) {
          setSlotsData(res.data);
          setSelectedDate(
            initialDate ? initialDate : (slotsData[0]?.date ?? ""),
          );
          setSelectedTime(
            initialTime
              ? initialTime
              : (selectedDateData?.times[0]?.time ?? ""),
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && serviceId) {
      fetchSlots();
    }
  }, [isOpen]);

  // Auto select first available time
  useEffect(() => {
    const handleFirstCheck = () => {
      if (selectedDateData) {
        const firstAvailable = selectedDateData.times.find((t) => !t.disabled);
        if (!initialTime && firstAvailable) {
          setSelectedTime(firstAvailable.time || "");
        }
      }
    };
    handleFirstCheck();
  }, [selectedDateData, initialDate, initialTime, slotsData]);

  const handleSave = useCallback(() => {
    if (!selectedDate || !selectedTime) return;
    onSelect({ date: selectedDate, time: selectedTime });
    onClose();
  }, [selectedDate, selectedTime, onSelect, onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose],
  );

  const toggleShowAll = useCallback(() => {
    setShowAllTimes((prev) => !prev);
  }, []);

  const renderDates = useMemo(() => {
    return (
      <div className="space-y-3">
        <p className="text-base font-bold text-ink">
          {CHECKOUT_CONST_TEXT.whenShouldOurExpertArrive}
        </p>
        <div className="flex flex-wrap gap-2">
          {slotsData.map((d) => {
            const dateData = slotsData.find((item) => item.date === d.date);

            return (
              <SelectablePill
                key={d.date}
                label={convertStringDateToGBFormat(d.date)}
                disabled={dateData?.isFullyOccupied ?? false}
                isActive={d.date === selectedDate}
                onClick={() => setSelectedDate(d.date)}
              />
            );
          })}
        </div>
      </div>
    );
  }, [selectedDate, slotsData]);

  const renderTimes = useMemo(() => {
    return (
      <div className="space-y-3">
        <p className="text-base font-bold text-ink">
          {CHECKOUT_CONST_TEXT.pleaseSelectTheStartTimeForService}
        </p>

        <div className="flex flex-wrap gap-2">
          {selectedDateData?.times
            .slice(0, showAllTimes ? undefined : 7)
            .map((slot) => (
              <SelectablePill
                key={slot.time}
                label={slot.time}
                disabled={slot.disabled}
                isActive={slot.time === selectedTime}
                onClick={() => setSelectedTime(slot.time)}
              />
            ))}

          {selectedDateData && selectedDateData?.times.length > 7 && (
            <Button
              variant="outline"
              className="rounded-full h-9 px-4 py-2 underline text-xs font-semibold border-line text-primary hover:bg-primary-soft"
              onClick={toggleShowAll}
            >
              {showAllTimes
                ? CHECKOUT_CONST_TEXT.showLess
                : CHECKOUT_CONST_TEXT.showMore}
            </Button>
          )}
        </div>
      </div>
    );
  }, [selectedDateData, selectedTime, showAllTimes, toggleShowAll]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-xs sm:max-w-100 rounded-xl p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6">
          <DialogTitle className="font-alexandria font-bold text-lg">
            {CHECKOUT_CONST_TEXT.bookSlot}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2 pt-1 space-y-6 h-full max-h-[calc(100vh-200px)] min-h-20 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-15">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-ink">Loading Slots...</p>
            </div>
          ) : (
            <>
              {renderDates}
              {(initialDate || selectedDate) && renderTimes}
            </>
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={onClose}
          >
            {CHECKOUT_CONST_TEXT.cancel}
          </Button>
          <Button
            disabled={
              !selectedDate ||
              !selectedTime ||
              (initialDate === selectedDate && initialTime === selectedTime)
            }
            onClick={handleSave}
            className="rounded-full"
          >
            {CHECKOUT_CONST_TEXT.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlotModal;
