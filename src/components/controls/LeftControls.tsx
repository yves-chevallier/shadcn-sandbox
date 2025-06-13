import { type IDockviewHeaderActionsProps } from "dockview";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LeftControls = (props: IDockviewHeaderActionsProps) => {
  const onClick = () => {
    props.containerApi.addPanel({
      id: `id_${Date.now().toString()}`,
      component: "default",
      title: `Tab 42`,
      position: {
        referenceGroup: props.group,
      },
    });
  };

  return (
    <div
      className="group-control"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0px 8px",
        height: "100%",
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Plus size={15} strokeWidth={2} className="hover:text-green-500" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem>Reload</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Close
            <DropdownMenuShortcut>⇧⌘W</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
