import { type IDockviewHeaderActionsProps } from "dockview";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const PrefixHeaderControls = (props: IDockviewHeaderActionsProps) => {
  return (
    <div
      className="group-control"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0px 8px",
        height: "100%",
        color: "var(--dv-activegroup-visiblepanel-tab-color)",
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Menu />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem>Reload</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => props.group.api.close()}>
            Close Group
            <DropdownMenuShortcut>⇧⌘W</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
