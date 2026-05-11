import { useState } from "react";

import CommonPopup from "@/components/common/CommonPopup";

interface IProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  saveText?: string;
}

const ConfirmPopup = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
  saveText = "Proceed",
}: IProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
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
      title={title}
      onSave={handleConfirm}
      loading={loading}
      saveText={saveText}
    >
      <div className="text-sm text-neutral-600">{message}</div>
    </CommonPopup>
  );
};

export default ConfirmPopup;
