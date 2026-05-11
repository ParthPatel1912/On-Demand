import { useEffect, useState } from "react";
import type { JSX } from "react";
import axios from "axios";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./dialog";

import { Trash2, Plus } from "lucide-react";

import { Button } from "./button";
import AddItemDialog from "./addItemDailog";
import { CATEGORIES, SUBCATEGORIES } from "@/utils/constants";

export default function CategoryPannel(): JSX.Element {
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  // Fake API Call (GET)
  const fetchData = async () => {
    try {
      // simulate API
      const res = await axios.get("/api/get-categories");

      // fallback to static if no backend
      setCategories(res?.data?.categories || CATEGORIES);
      setSubCategories(res?.data?.subCategories || SUBCATEGORIES);
    } catch (error) {
      console.error("Fetch categories error:", error);
      // fallback static
      setCategories(CATEGORIES);
      setSubCategories(SUBCATEGORIES);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add Category
  const handleAddCategory = async (value: string) => {
    try {
      await axios.post("/api/add-category", { name: value });

      setCategories((prev) => [...prev, value]);
    } catch (error) {
      console.error("Add category error:", error);
      setCategories((prev) => [...prev, value]);
    }
  };

  // Add SubCategory
  const handleAddSubCategory = async (value: string) => {
    try {
      await axios.post("/api/add-subcategory", { name: value });

      setSubCategories((prev) => [...prev, value]);
    } catch (error) {
      console.error("Add subcategory error:", error);
      setSubCategories((prev) => [...prev, value]);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (index: number) => {
    try {
      await axios.delete(`/api/category/${index}`);

      setCategories((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Delete category error:", error);
      setCategories((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Delete SubCategory
  const handleDeleteSubCategory = async (index: number) => {
    try {
      await axios.delete(`/api/subcategory/${index}`);

      setSubCategories((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Delete subcategory error:", error);
      setSubCategories((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>

        <DialogContent className="w-200 max-w-full rounded-[8px] border border-line bg-white flex flex-col max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4">
            <DialogTitle className="font-alexandria font-bold text-base leading-5.5 tracking-[0.0015em] text-ink">
              Cleaning Service
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 border border-line rounded-[8px] overflow-hidden">
              {/* Category */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-line">
                <div className="flex justify-between items-center px-6 py-4 border-b border-line">
                  <h3 className="text-base font-semibold font-alexandria leading-5.5 tracking-[0.0015em] text-ink">
                    Category
                  </h3>

                  <AddItemDialog
                    title="Add Category"
                    placeholder="Category"
                    onSave={handleAddCategory}
                    trigger={
                      <Button variant="secondary" size="sm">
                        <Plus size={14} /> Add
                      </Button>
                    }
                  />
                </div>

                <div className="p-4 space-y-2">
                  {categories.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium font-alexandria leading-5 tracking-[0.001em] text-ink ${
                        index === 0
                          ? "bg-ink/10"
                          : "hover:bg-gray-100 transition"
                      }`}
                    >
                      {item}
                      <Trash2
                        size={16}
                        onClick={() => handleDeleteCategory(index)}
                        className="text-gray-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub Category */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-line">
                  <h3 className="text-base font-semibold font-alexandria leading-5.5 tracking-[0.0015em] text-ink">
                    Sub Category
                  </h3>

                  <AddItemDialog
                    title="Add Sub Category"
                    placeholder="Sub Category"
                    onSave={handleAddSubCategory}
                    trigger={
                      <Button variant="secondary" size="sm">
                        <Plus size={14} /> Add
                      </Button>
                    }
                  />
                </div>

                <div className="p-4 space-y-2">
                  {subCategories.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium font-alexandria leading-5 tracking-[0.001em] text-ink hover:bg-gray-100 transition"
                    >
                      {item}
                      <Trash2
                        size={16}
                        onClick={() => handleDeleteSubCategory(index)}
                        className="text-gray-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 px-6 py-4">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
