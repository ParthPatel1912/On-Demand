import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";

import CommonPopup from "@/components/common/CommonPopup";
import { Button } from "@/components/ui/button";
import type {
  CategoryPayload,
  ICategory,
  ICategoryRes,
  ISubCategory,
  ModalState,
  SubCategoryPayload,
} from "@/types/masterData.interface";
import axiosInstance from "@/helper/axiosInstance";
import SimpleFormPopup from "./SimpleFormPopup";
import DeleteConfirmPopup from "../common/DeleteConfirmPopup";
import { FullPageLoader } from "@/components/common/Loader";
import { categorySchema, subCategorySchema } from "@/schemas";
import type { IProps } from "@/types/service.interface";


const ServicePopup = ({
  open,
  setOpen,
  serviceType,
  onHierarchyUpdated,
}: IProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const [modal, setModal] = useState<ModalState>({
    type: null,
    data: null,
  });

  const fetchCategories = useCallback(async () => {
    if (!serviceType?.id) return;
    setCategoriesLoading(true);
    try {
      const response = await axiosInstance.get(
        `service-types/${serviceType.id}/categories`
      );

      const data: ICategory[] = (response.data.data || []).map(
        (cat: ICategoryRes) => ({
          ...cat,
          isNew: false,
          subCategories: (cat.subcategories || []).map((sub: ISubCategory) => ({
            ...sub,
            isNew: false,
          })),
        })
      );

      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0]);
      }
      setIsChanged(false);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  }, [serviceType?.id]);

  useEffect(() => {
    if (open) {
      setSelectedCategory(null);
      fetchCategories();
    }
  }, [open, fetchCategories]);

  const closeModal = () => setModal({ type: null, data: null });

  const handleAddCategory = async (values: {
    name: string;
    image: File | null;
    imageRemoved: boolean;
  }) => {
    const trimmedName = values.name.trim().toLowerCase();

    const isDuplicate = categories.some(
      (cat) => cat.name.trim().toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error("Category with this name already exists");
      return;
    }

    const newCategory = {
      id: Date.now(),
      name: values.name,
      image: values.image,
      imageUrl: null,
      cloudinaryId: null,
      subCategories: [],
      isNew: true,
    };

    setCategories((prev) => [...prev, newCategory]);
    setIsChanged(true);
    closeModal();
  };

  const handleAddSubCategory = async (values: {
    name: string;
    image: File | null;
    imageRemoved: boolean;
  }) => {
    const trimmedName = values.name.trim().toLowerCase();

    const isDuplicate = selectedCategory?.subCategories?.some(
      (sub: ISubCategory) => sub.name.trim().toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      toast.error("Sub-category with this name already exists");
      return;
    }

    const newSubCategory = {
      id: Date.now(),
      name: values.name,
      image: values.image,
      imageUrl: null,
      cloudinaryId: null,
      isNew: true,
    };

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === selectedCategory?.id) {
          const updatedCat = {
            ...cat,
            subCategories: [...(cat.subCategories || []), newSubCategory],
          };

          setSelectedCategory(updatedCat);
          return updatedCat;
        }
        return cat;
      })
    );
    setIsChanged(true);

    closeModal();
  };

  const handleEditCategory = async (values: {
    name: string;
    image: File | null;
    imageRemoved: boolean;
  }) => {
    const item = modal.data;
    if (!item) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === item.id) {
          return {
            ...cat,
            name: values.name,
            image: values.imageRemoved ? null : (values.image || cat.image),
            imageUrl: (values.image || values.imageRemoved) ? null : cat.imageUrl,
          };
        }
        return cat;
      })
    );
    setIsChanged(true);

    if (selectedCategory?.id === item.id) {
      setSelectedCategory((prev) =>
        prev
          ? {
              ...prev,
              name: values.name,
              image: values.imageRemoved ? null : (values.image || prev.image),
              imageUrl: (values.image || values.imageRemoved) ? null : prev.imageUrl,
            }
          : null
      );
    }
    closeModal();
  };

  const handleEditSubCategory = async (values: {
    name: string;
    image: File | null;
    imageRemoved: boolean;
  }) => {
    const item = modal.data;
    if (!item || !selectedCategory) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === selectedCategory.id) {
          return {
            ...cat,
            subCategories: (cat.subCategories || []).map((sub) => {
              if (sub.id === item.id) {
                return {
                  ...sub,
                  name: values.name,
                  image: values.imageRemoved ? null : (values.image || sub.image),
                  imageUrl: (values.image || values.imageRemoved) ? null : sub.imageUrl,
                };
              }
              return sub;
            }),
          };
        }
        return cat;
      })
    );

    setSelectedCategory((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        subCategories: (prev.subCategories || []).map((sub) => {
          if (sub.id === item.id) {
            return {
              ...sub,
              name: values.name,
              image: values.imageRemoved ? null : (values.image || sub.image),
              imageUrl: (values.image || values.imageRemoved) ? null : sub.imageUrl,
            };
          }
          return sub;
        }),
      };
    });
    setIsChanged(true);

    closeModal();
  };

  const handleDeleteConfirm = async () => {
    const isCategory = modal.type === "delete-category";
    const item = modal.data;
    if (!item) return;

    try {
      if (isCategory) {
        if (!item.isNew) {
          await axiosInstance.delete(`/categories/${item.id}`);
          onHierarchyUpdated?.();
        }

        setCategories((prev) => prev.filter((cat) => cat.id !== item.id));

        if (selectedCategory?.id === item.id) {
          setSelectedCategory(null);
        }
        setIsChanged(true);
      } else {
        if (!item.isNew) {
          await axiosInstance.delete(`/subcategories/${item.id}`);
          onHierarchyUpdated?.();
        }

        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id === selectedCategory?.id) {
              const updatedCat = {
                ...cat,
                subCategories: (cat.subCategories || []).filter(
                  (sub: ISubCategory) => sub.id !== item.id
                ),
              };
              setSelectedCategory(updatedCat);
              return updatedCat;
            }
            return cat;
          })
        );
        setIsChanged(true);
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      closeModal();
    }
  };
  const handleSaveAll = async () => {
    if (!serviceType?.id) return;

    try {
      setLoading(true);

      const formData = new FormData();

      const categoriesData = categories.map((category, catIndex) => {
        const catData: CategoryPayload = {
          id: category.isNew ? undefined : category.id,
          name: category.name,
          image: null,
          subCategories: [],
        };

        // category image
        if (category.image instanceof File) {
          const key = `image_${catIndex}`;
          formData.append(key, category.image);
          catData.image = key; // reference
        } else if (category.imageUrl) {
          catData.image = category.imageUrl;
        }

        // subcategories
        catData.subCategories = (category.subCategories || []).map(
          (sub: ISubCategory, subIndex: number): SubCategoryPayload => {
            const subData: SubCategoryPayload = {
              id: sub.isNew ? undefined : sub.id,
              name: sub.name,
              image: null,
            };

            if (sub.image instanceof File) {
              const key = `image_${catIndex}_${subIndex}`;
              formData.append(key, sub.image);
              subData.image = key;
            } else if (sub.imageUrl) {
              subData.image = sub.imageUrl;
            }

            return subData;
          }
        );

        return catData;
      });

      // attach JSON
      formData.append("categories", JSON.stringify(categoriesData));

      // API CALL
      await axiosInstance.post(
        `/service-types/${serviceType.id}/categories/bulk`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Saved successfully!");
      setIsChanged(false);
      onHierarchyUpdated?.();
      setOpen(false);
    } catch (error) {
      console.error("Failed to save service", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SimpleFormPopup
        open={modal.type === "category"}
        title="Add Category"
        label="Category Name"
        schema={categorySchema}
        onClose={closeModal}
        onSubmit={handleAddCategory}
        isUpload
      />

      <SimpleFormPopup
        open={modal.type === "sub-category"}
        title="Add Sub Category"
        label="Sub Category Name"
        schema={subCategorySchema}
        onClose={closeModal}
        onSubmit={handleAddSubCategory}
        isUpload
      />

      <SimpleFormPopup
        open={modal.type === "category-edit"}
        title="Edit Category"
        label="Category Name"
        schema={categorySchema}
        onClose={closeModal}
        onSubmit={handleEditCategory}
        isUpload
        initialValues={{
          name: modal.data?.name || "",
          image: modal.data?.image || modal.data?.imageUrl || null,
        }}
      />

      <SimpleFormPopup
        open={modal.type === "sub-category-edit"}
        title="Edit Sub Category"
        label="Sub Category Name"
        schema={subCategorySchema}
        onClose={closeModal}
        onSubmit={handleEditSubCategory}
        isUpload
        initialValues={{
          name: modal.data?.name || "",
          image: modal.data?.image || modal.data?.imageUrl || null,
        }}
      />

      <DeleteConfirmPopup
        open={
          modal.type === "delete-category" ||
          modal.type === "delete-sub-category"
        }
        item={modal.data}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
      />

      <CommonPopup
        className="max-w-187.5! w-[95vw]"
        open={open}
        onOpenChange={setOpen}
        title={`${serviceType?.name || ""} Service`}
        loading={loading}
        footerClass="flex gap-3"
        onSave={handleSaveAll}
        isSaveDisabled={!isChanged}
      >
        <FullPageLoader isLoading={loading} />
        <div className="border border-slate-200 rounded-xl flex flex-col md:flex-row overflow-hidden bg-white">
          {/* Categories */}
          <DataListSection
            title="Category"
            loading={categoriesLoading}
            data={categories}
            selectedId={selectedCategory?.id}
            onSelect={setSelectedCategory}
            onAdd={() => setModal({ type: "category", data: null })}
            onEdit={(item) => setModal({ type: "category-edit", data: item })}
            onDelete={(item) =>
              setModal({ type: "delete-category", data: item })
            }
          />

          {/* Sub Categories */}
          <DataListSection
            title="Sub Category"
            loading={categoriesLoading}
            data={selectedCategory?.subCategories || []}
            disabled={categories.length === 0 || !selectedCategory}
            onAdd={() => setModal({ type: "sub-category", data: null })}
            onEdit={(item) => setModal({ type: "sub-category-edit", data: item })}
            onDelete={(item) =>
              setModal({ type: "delete-sub-category", data: item })
            }
            placeholder={
              !selectedCategory
                ? "Select a category first."
                : "No sub-categories found."
            }
          />
        </div>
      </CommonPopup>
    </>
  );
};

interface ISectionProps<T extends ICategory | ISubCategory> {
  title: string;
  loading: boolean;
  data: T[];
  selectedId?: number;
  onSelect?: (item: T) => void;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DataListSection = <T extends ICategory | ISubCategory>({
  title,
  loading,
  data,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  placeholder,
  disabled = false,
}: ISectionProps<T>) => (
  <div
    className={`flex flex-col ${
      title === "Category" ? "flex-5/2" : "flex-7/2"
    } ${
      onSelect
        ? "border-b md:border-b-0 border-r-2 border-line"
        : "bg-white"
    }`}
  >
    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
      <h3 className="font-bold text-ink text-base">{title}</h3>
      <Button
        variant="secondary"
        className="h-8 px-3"
        disabled={disabled}
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" /> Add
      </Button>
    </div>
    <div
      className={`min-h-40 md:min-h-80 md:max-h-80 flex-1 p-3 space-y-1 overflow-auto ${
        title === "Category" ? "bg-grey-50" : "bg-inherit"
      }`}
    >
      {loading ? (
        <div className="p-4 text-center text-sm text-gray-500">
          Loading {title.toLowerCase()}s...
        </div>
      ) : data.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">
          {placeholder || `No ${title.toLowerCase()}s found.`}
        </div>
      ) : (
        data.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect?.(item)}
            className={`flex items-center justify-between px-3 py-2 rounded-[8px] cursor-pointer transition-colors ${
              selectedId === item.id
                ? "bg-surface-muted"
                : "hover:bg-grey-100 bg-transparent"
            }`}
          >
            <span className="text-sm font-medium text-ink-mid">
              {item.name}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                className="hover:text-blue-500 h-2 px-1 py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Pencil className="w-2 h-2" strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                className="hover:text-red-500 h-2 px-1 py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
              >
                <Trash2 className="w-2 h-2" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default ServicePopup;
