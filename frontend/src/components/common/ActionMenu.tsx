import { MoreVertical, Pencil, List, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface IProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onManage?: () => void;
  extraActions?: ActionItem[];
  menuWidth?: string;
}

export const ActionMenu = ({
  onEdit,
  onDelete,
  onManage,
  extraActions = [],
  menuWidth = "w-36",
}: IProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-neutral-100 rounded-full transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        <MoreVertical className="h-4 w-4 text-ink-muted" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className={`${menuWidth}`}>
      {onManage && (
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onManage();
          }}
        >
          <List className="h-4 w-4 text-ink-muted" />
          <span>Manage</span>
        </DropdownMenuItem>
      )}
      {onEdit && (
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-4 w-4 text-ink-muted" />
          <span>Edit</span>
        </DropdownMenuItem>
      )}
      {extraActions.map((action, idx) => (
        <DropdownMenuItem
          key={idx}
          onClick={(event) => {
            event.stopPropagation();
            action.onClick();
          }}
        >
          {action.icon}
          <span className="text-sm leading-[16px] text-ink font-alexandria font-normal">{action.label}</span>
        </DropdownMenuItem>
      ))}
      {onDelete && (
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="!h-5 !w-5 text-ink-muted" />
          <span>Delete</span>
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);
