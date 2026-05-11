import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

import axiosInstance from "@/helper/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import defaultImg from "@/assets/Cleaning/cleaning1.png"

interface ICategory {
  id: string;
  name: string;
  subcategories?: ISubcategory[];
}

export interface ISubcategory {
  id: string;
  name: string;
  imageUrl?: string;
  serviceCount: number;
}

interface IProps {
  selectedSubCategory: ISubcategory | null;
  onSubCategorySelected: (subCategory: ISubcategory) => void;
  serviceTypeId: string;
  onLoadingComplete?: (hasCategories: boolean) => void;
}

export const ServiceCategoriesSidebar = ({
  selectedSubCategory,
  onSubCategorySelected,
  serviceTypeId,
  onLoadingComplete,
}: IProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const handleResponseWithLocationState = (response: {
    data: { data: ICategory[] };
  }) => {
    const firstCategory = response.data.data[0];
    if (firstCategory.subcategories && firstCategory.subcategories.length > 0) {
      if (location.state?.subcategory) {
        const { subcategory } = location.state || {};
        const foundCategory = response.data.data.find(
          (category: ICategory) => category.id === subcategory.categoryId,
        );
        const foundSubCategory = foundCategory?.subcategories?.find(
          (sub: ISubcategory) => sub.id === subcategory.id,
        );

        if (foundCategory?.id !== undefined) {
          setExpandedCategories([foundCategory.id]);
        }
        if (foundSubCategory !== undefined) {
          onSubCategorySelected(foundSubCategory);
        }
      } else {
        setExpandedCategories([response.data.data[0].id]);
        onSubCategorySelected(firstCategory.subcategories[0]);
      }
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/service-types/${serviceTypeId}/categories?excludeEmpty=${true}`,
        );
        setCategories(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          handleResponseWithLocationState(response);
          onLoadingComplete?.(true);
        } else {
          onLoadingComplete?.(false);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
        onLoadingComplete?.(false);
      } finally {
        setLoading(false);
      }
    };

    if (serviceTypeId) {
      fetchCategories();
    }
  }, [serviceTypeId]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  return (
    <div className="bg-white">
      {loading ? (
        <div className="space-y-4 md:space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-b border-line last:border-b-0 pb-4 md:pb-6 last:pb-0"
            >
              <Skeleton className="h-6 w-3/4 mb-3 md:mb-4" />
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-3 md:gap-4 p-2">
                    <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-md" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No categories available</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border-b border-line last:border-b-0 pb-4 md:pb-6 last:pb-0"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between text-left hover:text-primary transition-colors py-2 cursor-pointer"
              >
                <span className="font-bold text-[16px] leading-5.5 tracking-[0.15%] text-ink">
                  {category.name}
                </span>
                {!expandedCategories.includes(category.id) ? (
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                ) : (
                  <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                )}
              </button>

              {expandedCategories.includes(category.id) &&
                (category.subcategories && category.subcategories.length > 0 ? (
                  <div className="mt-3 md:mt-2 space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => onSubCategorySelected(subcategory)}
                        className={`w-full flex items-center gap-3 md:gap-4 p-2 md:p-2 rounded-lg transition-colors cursor-pointer ${
                          selectedSubCategory?.id === subcategory.id
                            ? "bg-primary-soft"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <img
                          src={
                            subcategory.imageUrl
                              ? subcategory.imageUrl
                              : defaultImg
                          }
                          alt={subcategory.name}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover shrink-0"
                        />
                        <span className="text-[14px] font-medium leading-5 tracking-[0.1%] text-ink align-middle text-left flex-1">
                          {subcategory.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 md:mt-2 text-center py-4">
                    <p className="text-xs md:text-sm text-gray-500">
                      No sub categories available
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
