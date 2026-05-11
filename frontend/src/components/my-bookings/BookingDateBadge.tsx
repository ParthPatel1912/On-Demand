import { Booking_primary_color } from "@/utils";

interface BookingDateBadgeProps {
  day: string;
  month: string;
}

const BookingDateBadge = ({ day, month }: BookingDateBadgeProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center text-white rounded-l-[8px] px-[13px] py-[4px]"
      style={{
        width: 72,
        height: 60,
        backgroundColor: Booking_primary_color,
      }}
    >
      <span className="text-xl leading-8 font-bold text-center">{day}</span>
      <span className="text-sm leading-5 font-medium tracking-[0.001em] text-center">
        {month}
      </span>
    </div>
  );
};

export default BookingDateBadge;
