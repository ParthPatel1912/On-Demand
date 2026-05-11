import { useCallback, useEffect, useMemo, useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import toast from "react-hot-toast";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SummaryCard } from "./SummaryCard";
import { ServiceTable } from "./ServiceTable";
import { AddEditService } from "@/components/service-management/AddEditService";
import { Button } from "@/components/ui/button";
import { FilterPanel, DEFAULT_FILTERS, type FilterState } from "./FilterPanel";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axiosInstance from "@/helper/axiosInstance";
import CommonPopup from "@/components/common/CommonPopup"
import { DEFAULT_ICON } from "@/utils/constants"
import type { ServiceHierarchy, ServiceManagementList, ServiceManagement } from "@/types/masterData.interface";

interface IProps {
  serviceType: ServiceHierarchy;
  onAddClick?: (serviceType: ServiceHierarchy) => void;
  isOpen?: boolean;
  onServiceSave?: () => void;
}

const INITIAL_VISIBLE_CATEGORIES = 6;
const CATEGORY_SEARCH_DEBOUNCE_MS = 300;

const buildQueryParams = (
  categoryId: number,
  filters: FilterState,
  page: number,
  limit: number
) => {
  const params = new URLSearchParams();

  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (filters.subCategoryId !== "all")
    params.set("subCategoryId", filters.subCategoryId);
  if (filters.priceMin > 0) params.set("priceMin", filters.priceMin.toString());
  if (filters.priceMax < 99999)
    params.set("priceMax", filters.priceMax.toString());
  if (filters.availability !== "all")
    params.set("availability", filters.availability);
  if (filters.commission) params.set("commission", filters.commission);

  return `/categories/${categoryId}/services?${params.toString()}`;
};

export const CategorySection = ({
  serviceType,
  onAddClick,
  isOpen,
  onServiceSave,
}: IProps) => {
  const SELECTED_SUBCATEGORY_KEY = `selected_subcategory_${serviceType.id}`;

  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [services, setServices] = useState<ServiceManagementList | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceManagement | null>(null);
  const [deleteItem, setDeleteItem] = useState<ServiceManagement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const selectedSub = serviceType.categories.find(
    (s) => s.id === selectedSubId
  );
  const shouldShowCategorySearch =
    serviceType.categories.length > INITIAL_VISIBLE_CATEGORIES;

  const filteredCategories = useMemo(() => {
    const normalizedQuery = debouncedCategorySearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return serviceType.categories;
    }

    return serviceType.categories.filter((sub) =>
      sub.name.toLowerCase().includes(normalizedQuery),
    );
  }, [debouncedCategorySearch, serviceType.categories]);

  const isSearchingCategories = debouncedCategorySearch.trim().length > 0;
  const visibleCategories =
    isSearchingCategories || showAllCategories
      ? filteredCategories
      : filteredCategories.slice(0, INITIAL_VISIBLE_CATEGORIES);
  const shouldShowCategoryToggle =
    serviceType.categories.length > INITIAL_VISIBLE_CATEGORIES &&
    !isSearchingCategories;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedCategorySearch(categorySearch);
    }, CATEGORY_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [categorySearch]);

  useEffect(() => {
    if (!shouldShowCategorySearch) {
      setCategorySearch("");
      setDebouncedCategorySearch("");
      setShowAllCategories(false);
    }
  }, [shouldShowCategorySearch]);

  const fetchServices = useCallback(
    async (
      categoryId: number,
      activeFilters: FilterState,
      currentPage: number,
      currentLimit: number
    ) => {
      try {
        setLoading(true);
        const url = buildQueryParams(
          categoryId,
          activeFilters,
          currentPage,
          currentLimit
        );
        const res = await axiosInstance.get(url);
        setServices(res.data);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen && !selectedSubId && serviceType.categories.length > 0) {
      const storedSubId = localStorage.getItem(SELECTED_SUBCATEGORY_KEY);
      if (storedSubId) {
        const parsedId = parseInt(storedSubId);
        const exists = serviceType.categories.some(
          (cat) => cat.id === parsedId
        );
        if (exists) {
          setSelectedSubId(parsedId);
        } else {
          const firstSubId = serviceType.categories[0].id;
          setSelectedSubId(firstSubId);
          localStorage.setItem(SELECTED_SUBCATEGORY_KEY, firstSubId.toString());
        }
      } else {
        const firstSubId = serviceType.categories[0].id;
        setSelectedSubId(firstSubId);
        localStorage.setItem(SELECTED_SUBCATEGORY_KEY, firstSubId.toString());
      }
    }
  }, [isOpen, selectedSubId, serviceType.categories, SELECTED_SUBCATEGORY_KEY]);

  useEffect(() => {
    if (selectedSubId) {
      fetchServices(selectedSubId, filters, page, limit);
    }
  }, [selectedSubId, filters, page, limit, fetchServices]);

  const handleFilter = (newFilters: FilterState) => {
    setPage(1); // reset to page 1 on new filter
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setPage(1); // reset to page 1 when rows-per-page changes
    setLimit(newLimit);
  };

  const handleEditService = (service: ServiceManagement) => {
    setEditingService(service);
    setOpenServiceDialog(true);
  };

  const handleDeleteService = (service: ServiceManagement) => {
    setDeleteItem(service);
  };

  const deleteService = async () => {
    if (!deleteItem?.id) return;

    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/services/${deleteItem.id}`);
      toast.success("Service deleted successfully!");
      setDeleteItem(null);
      fetchServices(selectedSubId || 0, filters, page, limit);
      onServiceSave?.();
    } catch (error: unknown) {
      console.error("Failed to delete service:", error);
      toast.error("Failed to delete service");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AccordionItem value={serviceType.id.toString()} className="mb-4">
      <AccordionTrigger
        className={cn(
          "flex items-center justify-between bg-card px-6 py-4 border-b border-red-100 h-16 transition-all cursor-pointer",
          "hover:no-underline rounded-xl hover:bg-gray-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "data-[state=open]:rounded-b-none"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <GripVertical className="h-5 w-5 text-ink-disabled/40" />
            {serviceType.image ? (
              <img
                src={serviceType.image}
                alt={serviceType.name}
                className="w-6 h-6 object-cover"
              />
            ) : (
              <span className="h-6 w-6 text-xl">{DEFAULT_ICON}</span>
            )}
            <span className="text-[17px] font-semibold text-ink">
              {serviceType.name}
            </span>
          </div>
          {isOpen && onAddClick && (
            <div className="flex items-center gap-3 mr-2">
              <div
                className="flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick(serviceType);
                }}
              >
                <Plus className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0 bg-card rounded-b-xl">
        {serviceType.categories.length > 0 ? (
          <div className="space-y-4 px-6 pt-8">
            {shouldShowCategorySearch && (
                <Input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories"
                  aria-label="Search categories"
                  className="max-w-xs mb-8 ml-auto"
                />
            )}

            {visibleCategories.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {visibleCategories.map((sub) => (
                    <SummaryCard
                      key={sub.id}
                      name={sub.name}
                      count={sub.servicesCount}
                      isActive={selectedSubId === sub.id}
                      onClick={() => {
                        setSelectedSubId(sub.id);
                        localStorage.setItem(
                          SELECTED_SUBCATEGORY_KEY,
                          sub.id.toString(),
                        );
                        setFilters(DEFAULT_FILTERS);
                        setPage(1);
                      }}
                    />
                  ))}
                </div>

                {shouldShowCategoryToggle && (
                  <div className="w-full flex justify-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:underline mx-auto my-2"
                      onClick={() => setShowAllCategories((prev) => !prev)}
                    >
                      {showAllCategories ? "View Less" : "View More"}{" "}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">
                No categories found
              </div>
            )}

            {selectedSub && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-[17px] font-bold text-ink-slate">
                    {selectedSub.name} Services
                  </h3>
                  <div className="flex items-center gap-3 justify-end">
                    <FilterPanel
                      subCategories={selectedSub.subcategories}
                      onFilter={handleFilter}
                    />
                    <Button
                      size="sm"
                      onClick={() => setOpenServiceDialog(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
                <ServiceTable
                  services={services}
                  loading={loading}
                  page={page}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center px-6 py-12 text-sm text-muted-foreground">
            No Data found.
          </div>
        )}
      </AccordionContent>

      <AddEditService
        open={openServiceDialog}
        onOpenChange={(open) => {
          setOpenServiceDialog(open);
          if (!open) {
            setEditingService(null);
          }
        }}
        initialData={{
          categoryId: selectedSubId?.toString() || "",
          ...(editingService && {
            id: editingService.id,
            name: editingService.name,
            price: parseFloat(editingService.price),
            duration: typeof editingService.duration === "string" 
              ? (parseInt(editingService.duration) || "") 
              : (editingService.duration ?? ""),
            subCategory: editingService.subCategoryId.toString(),
            commission: parseFloat(editingService.commission),
            availability: editingService.availability,
            serviceIncludes: editingService.includeServices?.length > 0,
            serviceExcludes: editingService.excludeServices?.length > 0,
            inclusionPointsList: editingService.includeServices || [],
            exclusionPointsList: editingService.excludeServices || [],
            serviceImages: editingService.images || [],
            serviceImagesIds: editingService.cloudinaryIds || [],
          }),
        }}
        isEdit={!!editingService}
        onSave={() => {
          setOpenServiceDialog(false);
          setEditingService(null);
          fetchServices(selectedSubId || 0, filters, page, limit);
          onServiceSave?.();
        }}
      />

      {/* Delete Confirmation Popup */}
      <CommonPopup
        className="w-100"
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Confirm Delete"
        onSave={deleteService}
        loading={deleteLoading}
        saveText="Delete"
      >
        <p className="text-sm text-neutral-600 wrap-break-word">
          This action cannot be undone. Are you sure you want to delete{" "}
          <b className="break-all inline-block max-w-full overflow-wrap-anywhere">
            {deleteItem?.name}
          </b>
          ?
        </p>
      </CommonPopup>
    </AccordionItem>
  );
};
