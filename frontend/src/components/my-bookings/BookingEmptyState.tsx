import type { BookingTab } from "@/types/myBookings.interface";
import { CalendarX } from "lucide-react";
import { MY_BOOKINGS_TEXT } from "@/constants/myBookings.text";

interface BookingEmptyStateProps {
  tab: BookingTab;
}

const BookingEmptyState = ({ tab }: BookingEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
      <CalendarX size={28} className="text-indigo-300" strokeWidth={1.5} />
    </div>
    <p className="text-base font-semibold text-gray-500">
      {tab === "UPCOMING" ? MY_BOOKINGS_TEXT.emptyUpcomingTitle : MY_BOOKINGS_TEXT.emptyCompletedTitle}
    </p>
    <p className="text-sm text-gray-400 mt-1 max-w-xs">
      {tab === "UPCOMING"
        ? MY_BOOKINGS_TEXT.emptyUpcomingDesc
        : MY_BOOKINGS_TEXT.emptyCompletedDesc}
    </p>
  </div>
);

export default BookingEmptyState;
