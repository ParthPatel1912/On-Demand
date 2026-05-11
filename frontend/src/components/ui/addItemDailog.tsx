import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "./dialog";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormikTextField from "./formikTextfield";
import type { AddItemDialogProps } from "@/types/common.interface";


export default function AddItemDialog({
  trigger,
  title,
  placeholder,
  onSave,
  useFormik = false,
}: AddItemDialogProps) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="
          w-full max-w-md sm:max-w-sm
          rounded-xl p-0
          overflow-hidden
          flex flex-col
          max-h-[90vh] 
        "
      >
        {/* Header */}
        <div className="px-4 py-3">
          <DialogTitle className="mt-4 font-alexandria font-bold text-base leading-5.5 tracking-[0.0015em]">
            {title}
          </DialogTitle>
        </div>

        {/* Body */}
        <div className="p-4 pt-0 flex-1 overflow-y-auto">
          {useFormik ? (
            <FormikTextField
              name="name"
              labelText={placeholder}
              placeholder={placeholder}
              formik={{
                values: { name: value },
                touched: {},
                errors: {},
                handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setValue(e.target.value),
                handleBlur: () => {},
              }}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="
                w-full px-4 py-3 text-sm
                rounded-[10px]
                border border-gray-200
                bg-gray-50
                placeholder:text-gray-400
                focus:bg-white
                focus:border-primary
                focus:ring-2 focus:ring-primary/20
                outline-none transition-all
              "
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 pt-0">
          <DialogClose asChild>
            <Button className="w-full" variant="secondary">
              Cancel
            </Button>
          </DialogClose>

          <Button
            className="w-full"
            onClick={() => {
              if (!value.trim()) return;

              onSave?.(value);
              setValue("");
              setOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
