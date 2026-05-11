import { useEffect, useState, useCallback } from "react";
import PageTitle from "@/components/common/PageTitle";
import BookingTabs from "@/components/my-bookings/BookingTabs";
import BookingListSkeleton from "@/components/my-bookings/BookingListSkeleton";
import BookingEmptyState from "@/components/my-bookings/BookingEmptyState";
import BookingCard from "@/components/my-bookings/BookingCard";
import type { Booking, BookingTab } from "@/types/myBookings.interface";
import { myBookingsServicesAPI } from "@/api/adminBookingManagement";
import type { IPagination } from "@/types/common.interface";
import { Button } from "@/components/ui/button";
import { MY_BOOKINGS_TEXT } from "@/constants/myBookings.text";

const MyBookingsPage = () => {
  const [activeTab, setActiveTab] = useState<BookingTab>("UPCOMING");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [pagination, setPagination] = useState<IPagination>({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchBookings = useCallback(
    async (tab: BookingTab, pageNumber: number) => {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const userId = Number(
          JSON.parse(localStorage.getItem("userInfo") || "{}").id
        );
        const response = await myBookingsServicesAPI({
          userId,
          tab,
          page: pageNumber,
          limit: pagination.limit,
        });
        if (response.success) {
          const newBookings = response?.data?.bookings ?? [];

          setBookings((prev) =>
            pageNumber === 1 ? newBookings : [...prev, ...newBookings]
          );

          setPagination(response.data.pagination);
        } else {
          setBookings([]);
          setPagination({
            currentPage: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 1,
          });
        }
      } catch (error: unknown) {
        console.error(MY_BOOKINGS_TEXT.errorFetchingBookings, error);
        setBookings([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    setBookings([]);
    setPagination({
      currentPage: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    });

    fetchBookings(activeTab, 1);
  }, [activeTab, fetchBookings]);

  const handleTabChange = (tab: BookingTab) => {
    setActiveTab(tab);
  };

  const loadMore = () => {
    const nextPage = pagination.currentPage + 1;
    fetchBookings(activeTab, nextPage);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[786px] mx-auto py-4">
        <div className="flex flex-wrap items-center justify-between mb-4 px-1 sm:px-4 md:px-0">
          <PageTitle title={MY_BOOKINGS_TEXT.title} />
          <BookingTabs activeTab={activeTab} onChange={handleTabChange} />
        </div>

        {loading && pagination.currentPage === 1 ? (
          <BookingListSkeleton count={3} />
        ) : bookings.length === 0 ? (
          <BookingEmptyState tab={activeTab} />
        ) : (
          <>
            <div className="space-y-4 px-1 sm:px-4 md:px-0">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>

            {loadingMore && (
              <div className="mt-4">
                <BookingListSkeleton count={2} />
              </div>
            )}

            {pagination.currentPage < pagination.totalPages && !loadingMore && (
              <div className="flex justify-center my-5">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="h-10 rounded-full border-2 border-outlined-border px-4 text-sm font-bold leading-5 text-primary hover:bg-primary/5"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
