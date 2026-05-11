import { useState, useEffect } from "react";

import CustomTable from "../common/CustomTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { GetOffersQueryDto, ICoupon } from "@/types/offers.interface";
import type { IPagination } from "@/types/common.interface";
import { getOffers } from "@/api/offer.services";

interface IProps {
  onCouponSelect?: (coupon: ICoupon) => void;
  appliedCoupon?: ICoupon | null;
  couponValidating?: boolean;
}

const CouponsModal = ({
  onCouponSelect,
  appliedCoupon = null,
  couponValidating = false,
}: IProps) => {
  const [couponsList, setCouponsList] = useState<ICoupon[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState<IPagination>({
    totalItems: 0,
    limit: 10,
    currentPage: 1,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCoupons = async (page = 1, perPage?: number) => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("per_page", (perPage || pagination.limit).toString());
      params.append("status", "active");
      params.append("is_applicable", "true");

      const response = await getOffers(params as GetOffersQueryDto);
      if (response.data.success && response.data.data) {
        setCouponsList(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
          setCurrentPage(response.data.pagination.currentPage);
        }
      } else {
        setCouponsList([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, currentPage: 1 }));
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCouponsList([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, currentPage: 1 }));
      setCurrentPage(1);
    } finally {
      setTableLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCoupons(page);
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setPagination((prev) => ({ ...prev, limit: rowsPerPage }));
    setCurrentPage(1);
    fetchCoupons(1, rowsPerPage);
  };

  const handleSelectCoupon = (coupon: ICoupon) => {
    if (onCouponSelect) {
      onCouponSelect(coupon);
    }
  };

  const columns = [
    {
      key: "coupon_code",
      header: "Coupon Code",
      render: (row: ICoupon) => (
        <div className="font-medium text-primary break-all">{row.coupon_code}</div>
      ),
    },
    {
      key: "coupon_description",
      header: "Description",
      render: (row: ICoupon) => (
        <div className="max-w-xs truncate">{row.coupon_description}</div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ICoupon) => (
        <div className="text-center">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleSelectCoupon(row)}
            disabled={couponValidating || appliedCoupon?.id === row.id}
            className={`font-bold ${appliedCoupon?.id === row.id
                ? "text-green-600 hover:text-green-700"
                : "text-primary hover:text-primary/80"
              }`}
          >
            {couponValidating && appliedCoupon?.id === row.id
              ? "Loading..."
              : appliedCoupon?.id === row.id
                ? "Applied"
                : "Add"}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (tableLoading && couponsList.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CustomTable
        headers={columns}
        listData={couponsList}
        pagination={true}
        totalItems={pagination.totalItems}
        currentPage={currentPage}
        rowsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        serverSide={true}
        notFoundText="No coupons available"
      />
    </div>
  );
};

export default CouponsModal;
