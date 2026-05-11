import toast from "react-hot-toast";
import { Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import images from "@/assets";
import type { IPartnerDocument } from "@/types/user-management/partner.interface";

const DocumentCard = ({ document }: { document: IPartnerDocument }) => {
  const handleDownload = async () => {
    if (!document.documentUrl) {
      toast.error("Document link not found");
      return;
    }

    try {
      const toastId = toast.loading(`Preparing ${document.documentName}...`);
      const response = await fetch(document.documentUrl);
      const blob = await response.blob();

      const filename = document.documentName;

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(`${document.documentName} downloaded successfully`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download document");
    }
  };

  return (
    <Card className="border-none bg-surface-subtle rounded-md overflow-hidden">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <img src={images.docIconSVG} />
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-ink text-base truncate"
            title={document.documentName}
          >
            {document.documentName}
          </h4>
          <span className="text-xs text-ink-muted font-medium">
            {document.size
              ? `${(Number(document.size) / (1024 * 1024)).toFixed(2)}MB`
              : `Added on ${new Date(document.createdAt).toLocaleDateString()}`}
          </span>
        </div>
        <Download
          className="h-5 w-5 text-primary cursor-pointer hover:text-primary-hover transition-colors"
          onClick={handleDownload}
        />
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
