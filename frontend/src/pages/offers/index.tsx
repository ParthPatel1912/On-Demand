import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useFormik } from "formik";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import { FloatingLabelInput } from "@/components/ui/input";
import { SelectItem, FloatingLabelSelect } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import CommonPopup from "@/components/common/CommonPopup";
import { FloatingLabelTextarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionMenu } from "@/components/common/ActionMenu";
import { FullPageLoader } from "@/components/common/Loader";
import { couponSchema } from "@/schemas";
import type {
  CreateOfferDto,
  GetOffersQueryDto,
  ICoupon,
  IFilterParams,
  UpdateOfferDto,
} from "@/types/offers.interface";
import FilterDrawer from "@/components/common/FilterDrawer";
import StatusBadge from "@/components/common/StatusBadge";
import type { IPagination } from "@/types/common.interface";
import { OFFERS_TEXT } from "@/constants/offers.text";
import { createOffer, deleteOffer, getOffers, updateOffer } from "@/api/offer.services";

const OffersPage = () => {
  const [couponsList, setCouponsList] = useState<ICoupon[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState<IPagination>({
    totalItems: 0,
    limit: 10,
    currentPage: 1,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ICoupon | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filters, setFilters] = useState<{
    discount: number;
    appliedRange: [number, number];
    availability: boolean;
  }>({
    discount: 0,
    appliedRange: [0, 99999],
    availability: true,
  });

  const [openDrawer, setOpenDrawer] = useState(false);
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (!openDrawer) setDraft(filters);
  }, [filters, openDrawer]);

  const fetchCoupons = async (
    page = 1,
    filters: IFilterParams = {},
    perPage?: number
  ) => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.append("page", page?.toString());
      params.append("per_page", (perPage || pagination.limit)?.toString());

      if (filters.discount && filters.discount > 0) {
        params.append("discount", filters.discount?.toString());
      }
      if (filters.min_applied) {
        params.append("min_applied", filters.min_applied?.toString());
      }
      if (filters.max_applied) {
        params.append("max_applied", filters.max_applied?.toString());
      }
      if (filters.availability !== undefined) {
        params.append("status", filters.availability ? "active" : "inactive");
      }

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
    } catch (error: unknown) {
      console.error(OFFERS_TEXT.errorFetchingCoupons, error);
      setCouponsList([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, currentPage: 1 }));
      setCurrentPage(1);
    } finally {
      setTableLoading(false);
    }
  };

  const handleFilter = () => {
    const isSame = JSON.stringify(draft) === JSON.stringify(filters);
    if (isSame) {
      setOpenDrawer(false);
      return;
    }

    setFilters(draft);

    const apiFilters = {
      discount: draft.discount > 0 ? draft.discount : undefined,
      min_applied:
        draft.appliedRange[0] > 0 ? draft.appliedRange[0] : undefined,
      max_applied:
        draft.appliedRange[1] < 99999 ? draft.appliedRange[1] : undefined,
      availability: draft.availability,
    };

    (Object.keys(apiFilters) as Array<keyof IFilterParams>).forEach((key) => {
      if (apiFilters[key] === undefined) {
        delete apiFilters[key];
      }
    });

    fetchCoupons(1, apiFilters);
    setOpenDrawer(false);
  };

  const handleResetFilter = () => {
    const defaultFilters = {
      discount: 0,
      appliedRange: [0, 99999] as [number, number],
      availability: true,
    };

    const isAppliedDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters);

    if (isAppliedDefault) {
      setDraft(defaultFilters);
      setOpenDrawer(false);
      return;
    }

    setFilters(defaultFilters);
    setDraft(defaultFilters);
    setCurrentPage(1);
    fetchCoupons(1, {});
    setOpenDrawer(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCoupons(page, {});
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setPagination((prev) => ({ ...prev, limit: rowsPerPage }));
    setCurrentPage(1);
    fetchCoupons(1, {}, rowsPerPage);
  };

  const handleEdit = (row: ICoupon) => {
    setIsEdit(true);
    setSelectedCoupon(row);

    formik.setValues({
      coupon_code: row.coupon_code,
      coupon_description: row.coupon_description,
      discount_percentage: row.discount_percentage,
      max_usage: row.max_usage,
      is_active: row.is_active,
    });

    setOpen(true);
  };

  const openDeletePopup = (row: ICoupon) => {
    setDeleteItem(row);
  };

  const deleteService = async () => {
    if (!deleteItem) return;

    try {
      setDeleteLoading(true);

      await deleteOffer(deleteItem.id);
      setDeleteItem(null);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      coupon_code: "",
      coupon_description: "",
      discount_percentage: 0,
      is_active: true,
      max_usage: 0,
    },
    validationSchema: couponSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);

        const requestBody: CreateOfferDto & UpdateOfferDto = {
          coupon_code: values.coupon_code,
          coupon_description: values.coupon_description,
          discount_percentage: values.discount_percentage,
          max_usage: values.max_usage,
        };

        if (isEdit && selectedCoupon) {
          requestBody.is_active = values.is_active;
          await updateOffer(selectedCoupon.id, requestBody as UpdateOfferDto);
        } else {
          await createOffer(requestBody as CreateOfferDto);
        }

        resetForm();
        setOpen(false);
        setSelectedCoupon(null);
        setIsEdit(false);
        fetchCoupons();
      } catch (err: unknown) {
        console.error("Submission failed:", err);
        const axiosError = err as AxiosError<{ errors?: Record<string, string[]> }>;
        if (axiosError.response?.data?.errors) {
          const backendErrors = axiosError.response.data.errors;
          const formikErrors: Record<string, string> = {};
          const formikTouched: Record<string, boolean> = {};

          Object.keys(backendErrors).forEach((key) => {
            formikErrors[key] = backendErrors[key][0];
            formikTouched[key] = true;
          });

          formik.setErrors(formikErrors);
          formik.setTouched(formikTouched);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const TableSkeleton = () => (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex space-x-4 p-4 border-b justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: pagination.limit }).map((_, index) => (
        <div
          key={index}
          className="flex space-x-4 p-4 border-b justify-between"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface-dashboard">
      <PageTitle title={OFFERS_TEXT.pageTitle}>
        <div className="flex gap-3">
          <FilterDrawer
            onFilter={handleFilter}
            onReset={handleResetFilter}
            open={openDrawer}
            onOpenChange={(next) => {
              if (next) setDraft(filters);
              setOpenDrawer(next);
            }}
            title={OFFERS_TEXT.filterTitle}
          >
            {/* Coupon Discount */}
            <div className="space-y-2">
              <FloatingLabelInput
                label={OFFERS_TEXT.couponDiscountFilter}
                value={draft.discount?.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setDraft((f) => ({ ...f, discount: Math.min(value, 90) }));
                }}
                type="number"
                min={0}
                max={90}
                rightAddon="%"
              />
            </div>

            {/* Coupon Applied Range */}
            <div className="space-y-4">
              <span className="text-sm font-bold text-ink-slate">
                {OFFERS_TEXT.couponAppliedFilter}
              </span>
              <div className="px-1">
                <Slider
                  value={draft.appliedRange}
                  max={99999}
                  step={1}
                  formatLabel={(val) => `${val}`}
                  onValueChange={(val) =>
                    setDraft((f) => ({
                      ...f,
                      appliedRange: val as [number, number],
                    }))
                  }
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-bold text-ink-disabled">
                    0
                  </span>
                  <span className="text-xs font-bold text-ink-disabled">
                    99999
                  </span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink-slate">
                  {OFFERS_TEXT.availabilityFilter}
                </span>
                <Switch
                  checked={draft.availability}
                  onCheckedChange={(checked) =>
                    setDraft((f) => ({ ...f, availability: checked }))
                  }
                />
              </div>
            </div>
          </FilterDrawer>
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="w-5 h-5" />
            {OFFERS_TEXT.addBtn}
          </Button>
        </div>
      </PageTitle>

      {/* Add/Edit Service Popup */}
      <CommonPopup
        className="w-100"
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          setSelectedCoupon(null);
          setIsEdit(false);
          formik.resetForm();
        }}
        title={isEdit ? OFFERS_TEXT.editCouponTitle : OFFERS_TEXT.addCouponTitle}
        loading={loading}
        onSave={formik.handleSubmit}
        onCancel={() => {
          setOpen(false);
          setSelectedCoupon(null);
          setIsEdit(false);
          formik.resetForm();
        }}
        bodyClassName="max-h-[calc(100vh-180px)]"
      >
        <FullPageLoader isLoading={loading} />
        <div>
          <FloatingLabelInput
            label={OFFERS_TEXT.couponCodeLabel}
            name="coupon_code"
            value={formik.values.coupon_code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.coupon_code
                ? (formik.errors.coupon_code as string | undefined)
                : undefined
            }
          />
        </div>
        <div>
          <FloatingLabelTextarea
            label={OFFERS_TEXT.couponDescLabel}
            name="coupon_description"
            value={formik.values.coupon_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.coupon_description
                ? (formik.errors.coupon_description as string | undefined)
                : undefined
            }
          />
        </div>
        <div className="flex flex-row sm:flex-col gap-4 sm:gap-1 w-full items-center justify-between">
        <div className="w-full mb-0 sm:mb-5">
          <FloatingLabelInput
            label={OFFERS_TEXT.couponDiscountLabel}
            name="discount_percentage"
            value={formik.values.discount_percentage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.discount_percentage
                ? (formik.errors.discount_percentage as string | undefined)
                : undefined
            }
            type="number"
            rightAddon="%"
            min={0}
            max={100}
          />
        </div>
        <div className="w-full">
          <FloatingLabelInput
            label={OFFERS_TEXT.maxUsageLabel}
            name="max_usage"
            value={formik.values.max_usage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.max_usage
                ? (formik.errors.max_usage as string | undefined)
                : undefined
            }
            type="number"
            min={0}
            max={1000000}
          />
        </div>
        </div>
        {isEdit && (
          <FloatingLabelSelect
            id="status"
            label={OFFERS_TEXT.statusLabel}
            value={formik.values.is_active ? "active" : "inactive"}
            onValueChange={(value) =>
              formik.setFieldValue("is_active", value === "active")
            }
          >
            <SelectItem value="active">{OFFERS_TEXT.activeOption}</SelectItem>
            <SelectItem value="inactive">{OFFERS_TEXT.inactiveOption}</SelectItem>
          </FloatingLabelSelect>
        )}
      </CommonPopup>

      {/* Delete Confirmation Popup */}
      <CommonPopup
        className="w-100"
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title={OFFERS_TEXT.confirmDeleteTitle}
        onSave={deleteService}
        loading={deleteLoading}
        saveText={OFFERS_TEXT.deleteBtn}
      >
        <p className="text-sm text-neutral-600 wrap-break-word">
          {OFFERS_TEXT.deleteWarningMsg}{" "}
          <b className="break-all inline-block max-w-full overflow-wrap-anywhere">
            {deleteItem?.coupon_code}
          </b>
          ?
        </p>
      </CommonPopup>

      <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden py-0 gap-0">
        <CardContent className="p-0 bg-white">
          {tableLoading ? (
            <TableSkeleton />
          ) : (
            <CustomTable
              headers={[
                {
                  key: "coupon_code",
                  header: OFFERS_TEXT.couponCodeHeader,
                  className: "text-left max-w-[200px] wrap-break-word",
                },
                {
                  key: "coupon_description",
                  header: OFFERS_TEXT.couponDescHeader,
                  className: "text-left max-w-75 wrap-break-word",
                },
                {
                  key: "discount_percentage",
                  header: OFFERS_TEXT.couponDiscountHeader,
                  className: "text-left",
                  render: (row) => row.discount_percentage_text,
                },
                {
                  key: "times_applied",
                  header: OFFERS_TEXT.couponAppliedHeader,
                  className: "text-left",
                  render: (row) => row.times_applied_text,
                },
                {
                  key: "max_usage",
                  header: OFFERS_TEXT.couponUsageLimit,
                  className: "text-center",
                  render: (row: ICoupon) => row.max_usage || "-",
                },
                {
                  key: "is_active",
                  header: OFFERS_TEXT.statusHeader,
                  className: "text-center",
                  render: (row) => <StatusBadge status={row.status_label} />,
                },
                {
                  key: "action",
                  header: OFFERS_TEXT.actionHeader,
                  className: "text-center w-[100px]",
                  render: (row: ICoupon) => (
                    <ActionMenu
                      onEdit={() => handleEdit(row)}
                      onDelete={() => openDeletePopup(row)}
                    />
                  ),
                },
              ]}
              listData={couponsList}
              pagination
              serverSide
              totalItems={pagination.totalItems}
              currentPage={currentPage}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OffersPage;
