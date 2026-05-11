import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { format, isValid, parse } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/helper/axiosInstance";
import PageTitle from "@/components/common/PageTitle";
import { formatUTC } from "@/utils";
import ExperienceCard from "../../../components/user-management/partner/ExperienceCard";
import DocumentCard from "../../../components/user-management/partner/DocumentCard";
import CustomTable from "@/components/common/CustomTable";
import {
  DEFAULT_ASSIGNED_FILTERS,
  SERVICE_PARTNERS_ADMIN_ACTION,
  SERVICE_PARTNER_STATUS,
  SERVICE_PARTNER_VERIFICATION_STATUS,
} from "@/utils/constants";
import type {
  AssignedServiceFilterState,
  IAssignedService,
  IPartnerDetail,
  ServicePartnersAdminAction,
} from "@/types/user-management/partner.interface";
import AssignedServiceFilterPanel from "@/components/user-management/partner/AssignedServiceFilterPanel";
import StatusBadge from "@/components/common/StatusBadge";

const DetailSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-regular text-ink-muted">{label}</span>
    <span className="text-base font-regular text-ink break-all">
      {value || "Not Provided"}
    </span>
  </div>
);

const TagSection = ({ label, tags }: { label: string; tags: string[] }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-regular text-ink-muted">{label}</span>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="h-7 px-3 py-1 rounded-[6px] border-line text-ink font-medium text-sm bg-white"
        >
          <span className="w-1 h-1 rounded-full bg-ink mr-1" />
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

const ServicePartnerDetails = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<IPartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Assigned Services states
  const [assignedServices, setAssignedServices] = useState<IAssignedService[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableLoading, setTableLoading] = useState(false);
  const [assignedFilters, setAssignedFilters] =
    useState<AssignedServiceFilterState>(DEFAULT_ASSIGNED_FILTERS);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`service-partners/${partnerId}`);
      if (response.data?.success) setPartner(response.data.data);
    } catch (err) {
      console.error("Failed to load details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedServices = async (
    page = currentPage,
    limit = rowsPerPage,
    activeFilters = assignedFilters,
  ) => {
    if (!partnerId) return;
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (activeFilters.date) {
        const parsedDate = parse(activeFilters.date, "dd/MM/yyyy", new Date());
        if (isValid(parsedDate)) {
          params.append("date", format(parsedDate, "yyyy-MM-dd"));
        }
      }
      if (activeFilters.time) {
        params.append("time", activeFilters.time);
      }
      if (activeFilters.status && activeFilters.status !== "all") {
        params.append("status", activeFilters.status);
      }

      const response = await axiosInstance.get(
        `service-partners/${partnerId}/assigned-services?${params.toString()}`,
      );

      if (response.data?.success) {
        setAssignedServices(response.data.data.bookings || []);
        setTotalItems(response.data.data.totalCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch assigned services:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [partnerId]);

  useEffect(() => {
    if (
      partner?.verificationStatus ===
      SERVICE_PARTNER_VERIFICATION_STATUS.VERIFIED
    ) {
      fetchAssignedServices();
    }
  }, [partner?.verificationStatus, currentPage, rowsPerPage]);

  const handleAssignedFilter = () => {
    setCurrentPage(1);
    fetchAssignedServices(1, rowsPerPage);
  };

  const handleAssignedReset = () => {
    setAssignedFilters(DEFAULT_ASSIGNED_FILTERS);
    setCurrentPage(1);
    fetchAssignedServices(1, rowsPerPage, DEFAULT_ASSIGNED_FILTERS);
  };

  const handleAdminAction = async (action: ServicePartnersAdminAction) => {
    try {
      await axiosInstance.patch(`service-partners/${partnerId}/approval`, {
        action,
      });
      toast.success(
        `Service partner request ${
          action === SERVICE_PARTNERS_ADMIN_ACTION.APPROVE
            ? "approved"
            : "rejected"
        }!`,
      );
      fetchDetail(); // Refresh details to get updated status
    } catch (err) {
      console.error("Error happened while approve partner:", err);
    }
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setCurrentPage(1);
    setRowsPerPage(rowsPerPage);
  };

  if (loading) return <DetailSkeleton />;
  if (!partner) return <div className="p-8 text-center">Partner not found</div>;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center min-w-0">
            <PageTitle className="pb-0!" title={partner.user?.name} />
            {partner.verificationStatus ===
              SERVICE_PARTNER_VERIFICATION_STATUS.VERIFIED && (
              <div className="flex items-center gap-3 sm:border-l border-neutral-200 sm:ml-3 sm:pl-3">
                <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                  <div className="p-0.5 rounded-full border-2 border-primary">
                    <Check className="h-3 w-3 stroke-4" />
                  </div>
                  {SERVICE_PARTNER_VERIFICATION_STATUS.VERIFIED}
                </div>
              </div>
            )}
          </div>
        </div>
        {partner.verificationStatus === SERVICE_PARTNER_STATUS.PENDING && (
          <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none h-10 bg-status-danger/10 text-status-danger! font-bold hover:bg-status-danger/15 rounded-lg px-4"
              onClick={() =>
                handleAdminAction(SERVICE_PARTNERS_ADMIN_ACTION.REJECT)
              }
            >
              <X className="h-5! w-5!" /> Reject
            </Button>
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none h-10 bg-status-success/10 text-status-success! font-bold hover:bg-status-success/15 rounded-lg px-4"
              onClick={() =>
                handleAdminAction(SERVICE_PARTNERS_ADMIN_ACTION.APPROVE)
              }
            >
              <Check className="h-5! w-5!" /> Approve
            </Button>
          </div>
        )}
      </div>

      <Card className="border-none shadow-sm rounded-xl overflow-hidden text-neutral-900 mx-0">
        <CardContent className="p-4 sm:p-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 mb-8">
            <InfoItem label="ID" value={partner.id} />
            <InfoItem label="Name" value={partner.user?.name} />
            <InfoItem label="Mobile Number" value={partner.user?.mobileNumber} />
            <InfoItem label="Email" value={partner.user.email} />
            <InfoItem
              label="Date of Birth"
              value={
                partner.dob ? format(new Date(partner.dob), "dd MMM yyyy") : "-"
              }
            />
            <InfoItem label="Gender" value={partner.gender} />
            <InfoItem
              label="Job"
              value={partner.serviceTypes?.map((t) => t.name).join(", ") || "-"}
            />
            <InfoItem
              label="Address"
              value={
                partner.permanentAddress ||
                partner.residentialAddress ||
                "Not Provided"
              }
            />
          </div>

          {/* Skills Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TagSection
              label="Skills"
              tags={
                partner.skills.length > 0
                  ? partner.skills.map((s) => s.category?.name)
                  : ["No skills added"]
              }
            />
            <TagSection
              label="Services Offered:"
              tags={
                partner.services.length > 0
                  ? partner.services.map((s) => s.subCategory?.name)
                  : ["No services added"]
              }
            />
            <TagSection
              label="Languages Spoken"
              tags={
                partner.languages.length > 0
                  ? partner.languages.map((l) => l.language)
                  : ["Not Provided"]
              }
            />

            <InfoItem
              label="Status"
              value={<StatusBadge status={partner.displayedStatus} variant="inactive" />}
            />
          </div>

          {/* Experience Section */}
          {partner.experiences && partner.experiences.length > 0 && (
            <section className="mt-8 space-y-4">
              <h2 className="text-lg font-bold text-ink-slate">
                Previous Job Experience
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partner.experiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            </section>
          )}

          {/* Documents Section */}
          {partner.documents && partner.documents.length > 0 && (
            <section className="mt-8 space-y-4">
              <h2 className="text-lg font-bold text-ink-slate">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partner.documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </section>
          )}

          {partner.verificationStatus ===
            SERVICE_PARTNER_VERIFICATION_STATUS.VERIFIED && (
            <section className="mt-8 space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <h2 className="text-lg font-bold text-ink-slate">
                  Assigned Services
                </h2>
                <AssignedServiceFilterPanel
                  filters={assignedFilters}
                  setFilters={setAssignedFilters}
                  onFilter={handleAssignedFilter}
                  onReset={handleAssignedReset}
                />
              </div>
              {tableLoading ? (
                <div className="py-10 text-center">
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <CustomTable
                  serverSide
                  pagination
                  totalItems={totalItems}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  headers={[
                    {
                      key: "name",
                      header: "Name",
                      render: (row) => row.service.name,
                    },
                    {
                      key: "customer",
                      header: "Customer",
                      render: (row) => row.customer?.name,
                    },
                    {
                      key: "bookingDate",
                      header: "Date",
                      render: (row) =>
                        formatUTC(row.bookingDate, "dd MMM yyyy hh:mm a"),
                    },
                    { key: "serviceAddress", header: "Address" },
                    {
                      key: "status",
                      header: "Status",
                      render: (row) => <StatusBadge status={row.status} />,
                    },
                  ]}
                  listData={assignedServices}
                  notFoundText="No assigned services found."
                />
              )}
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicePartnerDetails;
