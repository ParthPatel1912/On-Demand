import CommonPopup from "@/components/common/CommonPopup";
import type { IAdminUser } from "@/types/user-management/admin.interface";

interface IProps {
  deleteItem: IAdminUser | null;
  deleteLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAdminUserPopup = ({
  deleteItem,
  deleteLoading,
  onConfirm,
  onCancel,
}: IProps) => {
  return (
    <CommonPopup
      className="w-100"
      open={!!deleteItem}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title="Confirm Delete"
      onSave={onConfirm}
      loading={deleteLoading}
      saveText="Delete"
      onCancel={onCancel}
    >
      <p className="text-sm text-neutral-600 wrap-break-word">
        Are you sure you want to delete user{" "}
        <b className="break-all inline-block max-w-full">{deleteItem?.name}</b>?
        This action cannot be undone.
      </p>
    </CommonPopup>
  );
};

export default DeleteAdminUserPopup;
