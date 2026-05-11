import { Button } from "@/components/ui/button";
import type { BookingTab } from "@/types/myBookings.interface";
import { Booking_primary_color } from "@/utils";
import { MY_BOOKINGS_TEXT } from "@/constants/myBookings.text";

interface BookingTabsProps {
  activeTab: BookingTab;
  onChange: (tab: BookingTab) => void;
}

const TABS: { key: BookingTab; label: string }[] = [
  { key: "UPCOMING", label: MY_BOOKINGS_TEXT.tabUpcoming },
  { key: "COMPLETED", label: MY_BOOKINGS_TEXT.tabCompleted },
];

const BookingTabs = ({ activeTab, onChange }: BookingTabsProps) => (
  <div className="flex gap-2">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <Button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={
            isActive
              ? {
                  borderColor: Booking_primary_color,
                  color: Booking_primary_color,
                  border: "1px solid",
                }
              : { backgroundColor: "#F5F5F5", color: "#333333" }
          }
          className={`h-10 px-4 py-2.5 rounded-3xl text-sm font-normal transition-all duration-200 gap-2 
            ${isActive ? "font-semibold" : "font-normal"} `}
          variant="secondary"
        >
          {tab.label}
        </Button>
      );
    })}
  </div>
);

export default BookingTabs;
