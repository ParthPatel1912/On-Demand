import { useState } from "react";

import CommonPopup from "@/components/common/CommonPopup";
import type { IDeleteableItem } from "@/types/common.interface";

interface IProps {
  open: boolean;
  item: IDeleteableItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteConfirmPopup = ({ open, item, onClose, onConfirm }: IProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonPopup
      className="w-100 font-alexandria!"
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Confirm Delete"
      onSave={handleDelete}
      loading={loading}
      saveText="Delete"
    >
      <p className="text-sm text-neutral-600">
        This action cannot be undone. Are you sure you want to delete{" "}
        <b>"{item?.name || item?.user?.name}"</b>?
      </p>
    </CommonPopup>
  );
};

export default DeleteConfirmPopup;
