import { useState, useEffect } from "react";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { Button } from "@/components/ui/button";
import { AddAddressModal, type AddressPreFillData } from "./AddAddressModal";
import { LocationPickerModal } from "./LocationPickerModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteConfirmPopup from "../common/DeleteConfirmPopup";
import type { IAddress } from "@/types/masterData.interface";
import { AddressListSkeleton } from "./ProfileSkeleton";
import { PROFILE_TEXT } from "@/constants/profile.text";

interface RecentSearch {
  id: number;
  latitude: string;
  longitude: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

interface IProps {
  initialAddresses?: IAddress[];
}

const nullProfileData = {
  houseNumber: "",
  landmark: "",
  latitude: 0,
  longitude: 0,
  adressline_1: "",
  addressline_2: "",
  postcode: "",
  city: "",
  state: "",
  country: "",
};

export const SavedAddresses = ({ initialAddresses = [] }: IProps) => {
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addresses, setAddresses] = useState<IAddress[]>(initialAddresses);
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<IAddress | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [prefillData, setPrefillData] =
    useState<AddressPreFillData>(nullProfileData);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceLaravel.get("customer/addresses");
      if (response.data && response.data.data) {
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error("Fetch addresses error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  const handleAddClick = async () => {
    try {
      const response = await axiosInstanceLaravel.get(
        "customer/recent-searches"
      );
      if (response.data?.data) {
        setRecentSearches(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch recent searches:", error);
    }
    setIsLocationPickerOpen(true);
  };

  const handleSaveAddress = () => {
    fetchAddresses();
    setIsAddAddressOpen(false);
    setPrefillData(nullProfileData);
  };

  // Receives structured address data from LocationPickerModal when a suggestion is selected
  const handlePlaceSelect = (data: AddressPreFillData) => {
    setPrefillData(data);
    setEditingAddressId(null);
    setIsAddAddressOpen(true);
  };

  const handleDeleteAddress = (address: IAddress) => {
    setAddressToDelete(address);
    setIsDeleteOpen(true);
  };
  const handleEditAddress = (address: IAddress) => {
    setEditingAddressId(address.id);
    setIsAddAddressOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await axiosInstanceLaravel.delete(
        `customer/addresses/${addressToDelete.id}`
      );
      toast.success(PROFILE_TEXT.addressDeleteSuccess);
      fetchAddresses(); // Refresh the list
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(PROFILE_TEXT.addressDeleteError);
    }
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setAddressToDelete(null);
  };

  return (
    <div className="w-full border border-line rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-alexandria font-bold text-lg text-ink">
          {PROFILE_TEXT.savedAddressesTitle}
        </h2>
        <Button
          variant="outline"
          size="default"
          className="text-primary border-line font-bold flex items-center gap-2 px-6 py-2 rounded-full h-10 hover:bg-primary hover:text-white transition-all shadow-none"
          onClick={handleAddClick}
        >
          <Plus className="w-5 h-5" />
          {PROFILE_TEXT.addBtn}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <AddressListSkeleton count={3} />
        ) : addresses.length > 0 ? (
          addresses.map((address, index) => (
            <div
              key={address.id}
              className={
                index !== 0
                  ? "pt-6 border-t border-line flex items-start justify-between"
                  : "flex items-start justify-between"
              }
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-alexandria font-bold text-base text-ink">
                  {address.house_flat_number} {address.landmark}
                </h3>
                <p className="font-alexandria font-medium text-sm text-ink-muted">
                  {address.address}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-gray-100 rounded-full transition-colors outline-none cursor-pointer">
                    <MoreVertical className="w-5 h-5 text-ink-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={() => handleEditAddress(address)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil className="h-4 w-4 text-neutral-500" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteAddress(address)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-ink-muted font-alexandria font-medium text-sm">
              {PROFILE_TEXT.noSavedAddresses}
            </p>
          </div>
        )}
      </div>

      <LocationPickerModal
        open={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onPlaceSelect={handlePlaceSelect}
        recentSearches={recentSearches}
      />

      <AddAddressModal
        open={isAddAddressOpen}
        onClose={() => {
          setIsAddAddressOpen(false);
          setEditingAddressId(null);
          setPrefillData(nullProfileData);
        }}
        onChange={() => {
          setIsAddAddressOpen(false);
          setIsLocationPickerOpen(true);
        }}
        onSave={handleSaveAddress}
        editId={editingAddressId || undefined}
        prefillData={prefillData}
      />

      <DeleteConfirmPopup
        open={isDeleteOpen}
        item={
          addressToDelete
            ? {
                ...addressToDelete,
                name: `${addressToDelete.house_flat_number} ${addressToDelete.landmark}`,
              }
            : null
        }
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
