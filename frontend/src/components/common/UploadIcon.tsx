import { useRef, useState, useEffect } from "react";
import { ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IUploadProps } from "@/types/common.interface";


const UploadIcon = ({
  value,
  previewUrl,
  displayPreviewOnTop = false,
  className,
  previewClassName,
  onChange,
  onRemove,
  label = "Upload icon",
}: IUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [value]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const displayUrl = objectUrl || previewUrl;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className={`${
          displayPreviewOnTop ? "flex-column" : "flex"
        } gap-2 items-center mb-2`}
      >
        {displayUrl && (
          <div
            className={`relative group ${
              previewClassName
                ? previewClassName
                : "h-9 w-9 rounded-md overflow-hidden bg-primary-soft/50 p-1 flex items-center justify-center"
           }`}
          >
            <img
              src={displayUrl}
              alt="Icon preview"
              className="h-full w-full object-contain rounded-xs"
            />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute inset-0 flex items-center justify-center text-white rounded-md bg-[#000000A3] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          className={`h-9 px-2.5 py-1.5 ${className}`}
          onClick={handleClick}
        >
          <ArrowUp className="h-4 w-4" />
          {label}
        </Button>
      </div>
    </>
  );
};

export default UploadIcon;
