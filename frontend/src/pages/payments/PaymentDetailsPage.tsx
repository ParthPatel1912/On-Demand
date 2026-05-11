import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent } from "@/components/ui/card";
import CustomTable from "@/components/common/CustomTable";
import { APP_ROUTES } from "@/routes/config";
import axiosInstance from "@/helper/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import CommonPopup from "@/components/common/CommonPopup";
import { CurrencySymbol } from "@/utils/constants";
import type {
  IOtherTransaction,
  ITransactionDetails,
} from "@/types/payments.interface";

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-xs text-ink-muted font-medium mb-1">{label}</p>
    <p className="text-sm text-ink font-semibold break-all">{value}</p>
  </div>
);

const PaymentDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<ITransactionDetails | null>(null);
  const [otherTransactions, setOtherTransactions] = useState<
    IOtherTransaction[]
  >([]);
  const [deleteItem, setDeleteItem] = useState<IOtherTransaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTransactionDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/transactions/${id}`);
      if (response.data.success) {
        setDetails(response.data.data);
        setOtherTransactions(response.data.data.otherTransactions || []);
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setDetails(null);
      setOtherTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransactionDetails();
  }, [fetchTransactionDetails]);

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleteLoading(true);
      const response = await axiosInstance.delete(
        `/transactions/${deleteItem.id}`,
      );
      if (response.data.success) {
        toast.success("Transaction deleted successfully");
        setDeleteItem(null);
        fetchTransactionDetails();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading || !details) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-8 space-y-4">
            <div className="grid grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-alexandria bg-surface-dashboard min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(APP_ROUTES.ADMIN_PAYMENTS)}
          className="p-2 hover:bg-grey-200 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-ink-muted" />
        </button>
        <h1 className="text-2xl font-bold text-ink-DEFAULT">
          {details.userName}
        </h1>
      </div>

      {/* Details Card */}
      <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
            <InfoItem label="User" value={details.userName} />
            <InfoItem label="Transaction ID" value={details.transactionId} />
            <InfoItem label="Mobile Number" value={details.mobileNumber} />
            <InfoItem label="Service" value={details.serviceName} />
            <InfoItem label="Service ID" value={details.serviceId} />

            <div>
              <p className="text-xs text-ink-muted font-medium mb-1">Amount</p>
              <p className="text-sm text-ink-currency font-semibold">
                +{CurrencySymbol[details.currency] || "$"}
                {details.amount.toFixed(2)}
              </p>
            </div>

            <InfoItem label="Payment Type" value={details.paymentType} />
            <InfoItem label="Payment Method" value={details.paymentMethod} />
            <InfoItem label="Date & Time" value={details.dateTime} />
          </div>

          {/* Table */}
          <div className="mt-6">
            <h2 className="text-base font-bold text-ink-DEFAULT mb-4">
              Other Payment & Transaction
            </h2>

            <div className="rounded-xl overflow-hidden">
              <CustomTable
                headerWrapperClassName="bg-white border-b border-line-light"
                headers={[
                  {
                    key: "transactionId",
                    header: "Transaction ID",
                    className:
                      "text-left text-ink-disabled text-sm max-w-[200px]",
                    render: (row: IOtherTransaction) => (
                      <span
                        title={row.transactionId}
                        className="truncate block text-ink text-sm"
                      >
                        {row.transactionId}
                      </span>
                    ),
                  },
                  {
                    key: "service",
                    header: "Service",
                    className: "text-ink-disabled text-left text-sm",
                    render: (row: IOtherTransaction) => (
                      <span className="text-ink text-sm">
                        {row.service}
                      </span>
                    ),
                  },
                  {
                    key: "amount",
                    header: "Amount",
                    className: "text-ink-disabled text-left text-sm",
                    render: (row: IOtherTransaction) => (
                      <span className="text-ink-currency text-sm whitespace-nowrap">
                        +{CurrencySymbol[row.currency] || "$"}
                        {Number(row.amount).toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    key: "paymentMethod",
                    header: "Payment Method",
                    className: "text-ink-disabled text-left text-sm",
                    render: (row: IOtherTransaction) => (
                      <span className="text-ink text-sm">
                        {row.paymentMethod}
                      </span>
                    ),
                  },
                  {
                    key: "action",
                    header: "Action",
                    className: "text-right pr-6 text-ink-disabled text-sm",
                    render: (row: IOtherTransaction) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteItem(row);
                        }}
                        className="p-2 hover:bg-status-danger-soft text-ink-muted hover:text-status-danger rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    ),
                  },
                ]}
                listData={otherTransactions}
                pagination={true}
                serverSide={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Popup */}
      <CommonPopup
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Confirm Delete"
        onSave={handleDelete}
        loading={deleteLoading}
        saveText="Delete"
      >
        <p className="text-sm text-ink-muted break-words">
          This action cannot be undone. Are you sure you want to delete
          transaction{" "}
          <b className="text-ink break-all">{deleteItem?.transactionId}</b>?
        </p>
      </CommonPopup>
    </div>
  );
};

export default PaymentDetailsPage;
