import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ToolButton: React.FC<{
  Icon: LucideIcon;
  description: string;
  onClick: () => void;
  state?: boolean; // For toggle buttons
  className?: string;
}> = ({ Icon, description, onClick, state, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`p-1 ${state ? "bg-muted" : ""}`}
          onClick={onClick}
        >
          <Icon className={`w-4 h-4  ${className}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{description}</TooltipContent>
    </Tooltip>
  );
};
