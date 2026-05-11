import { useEffect, useRef, useState } from "react";
import { Plus, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/helper/axiosInstance";
import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionMenu } from "@/components/common/ActionMenu";
import AdminUserFilter from "../../../components/user-management/admin/AdminUserFilter";
import AddEditAdminUserPopup from "../../../components/user-management/admin/AddEditAdminUserPopup";
import DeleteAdminUserPopup from "../../../components/user-management/admin/DeleteAdminUserPopup";
import ChangePasswordPopup from "../../../components/user-management/admin/ChangePasswordPopup";
import { useAdminDetail } from "@/context/AdminDetailContext";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import {
  ADMIN_STATUS,
  PROFILE_UPDATE_TYPE,
  USER_MANAGEMENT_STATUS_OPTIONS,
} from "@/utils/constants";
import type { IPagination, ISortProps } from "@/types/common.interface";
import type {
  AdminUserFilterValues,
  AdminUserFormValues,
  IAdminUser,
} from "@/types/user-management/admin.interface";
import StatusBadge from "@/components/common/StatusBadge";

const buildApiParams = (
  page: number,
  limit: number,
  filterValues: AdminUserFilterValues,
  sort: ISortProps
): URLSearchParams => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  params.append("sortBy", sort.sortBy || "id");
  params.append("sortOrder", sort.sortOrder || "DESC");

  if (filterValues.search !== "") {
    params.append("search", filterValues.search);
  }
  if (filterValues.status !== USER_MANAGEMENT_STATUS_OPTIONS.ALL) {
    params.append("status", filterValues.status);
  }

  return params;
};

const AdminUsersPage = () => {
  const [usersList, setUsersList] = useState<IAdminUser[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { adminDetail } = useAdminDetail();
  const [pagination, setPagination] = useState<IPagination>({
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [sortConfig, setSortConfig] = useState<ISortProps>({
    sortBy: "id",
    sortOrder: "DESC",
  });
  const [appliedFilters, setAppliedFilters] = useState<AdminUserFilterValues>({
    search: "",
    status: "all",
  });
  const limitRef = useRef(10);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IAdminUser | null>(null);
  const [addEditLoading, setAddEditLoading] = useState(false);
  const [deleteItem, setDeleteItem] = useState<IAdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [changePassUser, setChangePassUser] = useState<IAdminUser | null>(null);
  const [changePassLoading, setChangePassLoading] = useState(false);

  const fetchUsers = async (
    page: number = pagination.currentPage,
    limit: number = pagination.limit,
    filters: AdminUserFilterValues = appliedFilters,
    currentSort = sortConfig
  ) => {
    try {
      setTableLoading(true);
      limitRef.current = limit;

      const params = buildApiParams(page, limit, filters, currentSort);
      const response = await axiosInstance.get(
        `admin-users?${params.toString()}`
      );

      if (response.data.success) {
        setUsersList(response.data.data ?? []);

        const meta: IPagination = response.data.pagination;
        setPagination(meta);
      } else {
        setUsersList([]);
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setUsersList([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1, currentPage: 1 }));
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (newFilters?: AdminUserFilterValues) => {
    setPagination({ ...pagination, currentPage: 1 });
    fetchUsers(1, pagination.limit, newFilters || appliedFilters);
  };

  const handleResetFilter = () => {
    const reset: AdminUserFilterValues = {
      search: "",
      status: USER_MANAGEMENT_STATUS_OPTIONS.ALL,
    };
    setAppliedFilters(reset);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    fetchUsers(1, pagination.limit, reset);
  };

  const handleSort = (key: string) => {
    const newOrder =
      sortConfig.sortBy === key && sortConfig.sortOrder === "ASC"
        ? "DESC"
        : "ASC";
    const newSort = { sortBy: key, sortOrder: newOrder as "ASC" | "DESC" };
    setSortConfig(newSort);
    fetchUsers(pagination.currentPage, pagination.limit, appliedFilters, newSort);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.limit);
  };

  const handleRowsPerPageChange = (limit: number) => {
    fetchUsers(1, limit);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedUser(null);
    setAddEditOpen(true);
  };

  const handleEdit = (row: IAdminUser) => {
    setIsEdit(true);
    setSelectedUser(row);
    setAddEditOpen(true);
  };

  const handleSaveUser = async (
    values: AdminUserFormValues,
    editing: boolean,
    userId?: string
  ) => {
    try {
      setAddEditLoading(true);

      if (editing && userId) {
        await axiosInstance.put(`admin-users/${userId}`, {
          name: values.name,
          email: values.email,
          mobile: values.mobile,
        });
      } else {
        const formData = new FormData();
        if (values.name) formData.append("name", values.name?.trim());
        if (values.email) formData.append("email", values.email?.trim());
        if (values.mobile)
          formData.append("mobile", values.mobile?.toString().trim());
        if (values.password) formData.append("password", values.password);
        if (values.confirmPassword)
          formData.append("confirmPassword", values.confirmPassword);

        await axiosInstance.post("admin-users", formData);
      }

      setAddEditOpen(false);
      setSelectedUser(null);
      setIsEdit(false);
      fetchUsers(pagination.currentPage, pagination.limit);
    } catch (err) {
      console.error("Save user error:", err);
      throw err;
    } finally {
      setAddEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`admin-users/${deleteItem.id}`);
      setDeleteItem(null);

      // If we deleted the last item on the current page, go back one page
      const newPage =
        usersList.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage;
      fetchUsers(newPage, pagination.limit);
    } catch (err) {
      console.error("Delete user error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveChangePassword = async (
    currentPassword: string,
    password: string,
    confirmPassword: string
  ) => {
    if (!changePassUser) return;
    try {
      setChangePassLoading(true);
      const formData = new FormData();
      formData.append("type", PROFILE_UPDATE_TYPE.PASSWORD);
      if (currentPassword) formData.append("current_password", currentPassword);
      if (password) formData.append("password", password);
      if (confirmPassword)
        formData.append("password_confirmation", confirmPassword);
      await axiosInstanceLaravel.put(`/admin/update-profile`, formData);
      setChangePassUser(null);
    } catch (err) {
      console.error("Change password error:", err);
      throw err;
    } finally {
      setChangePassLoading(false);
    }
  };

  const TableSkeleton = () => (
    <div className="space-y-3">
      <div className="flex space-x-4 p-4 border-b justify-between">
        {["w-12", "w-32", "w-52", "w-24", "w-20", "w-16"].map((w, i) => (
          <Skeleton key={i} className={`h-4 ${w}`} />
        ))}
      </div>
      {Array.from({ length: limitRef.current }).map((_, i) => (
        <div key={i} className="flex space-x-4 p-4 border-b justify-between">
          {["w-12", "w-32", "w-52", "w-24", "w-20", "w-8"].map((w, j) => (
            <Skeleton key={j} className={`h-4 ${w}`} />
          ))}
        </div>
      ))}
    </div>
  );

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      className: "text-left wrap-break-word",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      className: "text-left wrap-break-word",
      sortable: true,
    },
    {
      key: "isActive",
      header: "Status",
      className: "text-center",
      render: (row: IAdminUser) => (
        <StatusBadge status={row.isActive ? ADMIN_STATUS.ACTIVE : ADMIN_STATUS.INACTIVE} />
      ),
    },
    {
      key: "action",
      header: "Action",
      className: "text-center w-[100px]",
      render: (row: IAdminUser) => {
        const currentAdminId = adminDetail?.id.toString();
        const extraActions =
          currentAdminId === row.id
            ? [
                {
                  label: "Change Password",
                  onClick: () => setChangePassUser(row),
                  icon: <Lock className="h-4 w-4 text-neutral-500" />,
                },
              ]
            : [];

        return (
          <div className="flex justify-center">
            <ActionMenu
              onEdit={() => handleEdit(row)}
              onDelete={() => setDeleteItem(row)}
              extraActions={extraActions}
              menuWidth={currentAdminId === row.id ? "w-50 sm:w-55" : ""}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-surface-dashboard">
      <PageTitle
        title="Admin Users"
        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 pb-3"
      >
        <div className="flex gap-3">
          <AdminUserFilter
            filters={appliedFilters}
            setAppliedFilters={setAppliedFilters}
            onFilter={handleFilter}
            onReset={handleResetFilter}
          />

          <Button onClick={handleOpenAdd} size="sm">
            <Plus className="w-5 h-5" />
            Add
          </Button>
        </div>
      </PageTitle>
      <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden py-0 gap-0">
        <CardContent className="p-0 bg-white">
          {tableLoading ? (
            <TableSkeleton />
          ) : (
            <CustomTable
              headers={columns}
              pagination
              serverSide
              listData={usersList}
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSort={handleSort}
              sortBy={sortConfig.sortBy}
              sortOrder={sortConfig.sortOrder}
              notFoundText="No support tickets found."
            />
          )}
        </CardContent>
      </Card>

      <AddEditAdminUserPopup
        open={addEditOpen}
        setAddEditOpen={setAddEditOpen}
        isEdit={isEdit}
        selectedUser={selectedUser}
        loading={addEditLoading}
        onSave={handleSaveUser}
        onCancel={() => {
          setAddEditOpen(false);
          setSelectedUser(null);
          setIsEdit(false);
        }}
      />
      <DeleteAdminUserPopup
        deleteItem={deleteItem}
        deleteLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteItem(null)}
      />

      <ChangePasswordPopup
        open={!!changePassUser}
        onOpenChange={(open) => {
          if (!open) setChangePassUser(null);
        }}
        loading={changePassLoading}
        onSave={handleSaveChangePassword}
        onCancel={() => setChangePassUser(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
