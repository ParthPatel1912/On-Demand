import { cn } from "@/lib/utils";
import { capitalize, getStatusClass } from "@/utils";
import { Badge } from "../ui/badge";

interface IProps {
  status: string;
  case?: "uppercase" | "lowercase";
  variant?: "danger" | "inactive";
}

const StatusBadge = ({ status, case: textCase, variant }: IProps) => {
  const { badge, icon } = getStatusClass(status, variant);

  const getFormattedStatus = () => {
    if (textCase === "uppercase") return status.toUpperCase();
    if (textCase === "lowercase") return status.toLowerCase();
    return capitalize(status);
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md border-none font-medium text-sm w-max h-[28px] font-alexandria",
        badge
      )}
    >
      <span className={cn("w-1 h-1 rounded-full mr-1", icon)} />
      {getFormattedStatus()}
    </Badge>
  );
};

export default StatusBadge;
