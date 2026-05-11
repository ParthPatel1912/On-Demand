import { DASHBOARD_TEXT } from "@/constants/dashboard.text";

const DashboardEmptyState = () => (
  <div className="flex items-center justify-center py-30 text-sm text-ink-muted">
    {DASHBOARD_TEXT.emptyMessage}
  </div>
);

export default DashboardEmptyState;
