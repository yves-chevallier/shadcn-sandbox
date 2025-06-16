import { type IDockviewHeaderActionsProps } from "dockview";
import * as React from "react";

import {
  X,
  PictureInPicture2,
  Columns2,
  Rows2,
  Minimize2,
  Maximize2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const RightControls = (props: IDockviewHeaderActionsProps) => {
  const [isMaximized, setIsMaximized] = React.useState<boolean>(
    props.containerApi.hasMaximizedGroup()
  );


  React.useEffect(() => {
    const disposable = props.containerApi.onDidMaximizedGroupChange(() => {
      setIsMaximized(props.containerApi.hasMaximizedGroup());
    });

    return () => {
      disposable.dispose();
    };
  }, [props.containerApi]);

  const setFloat = () => {
    props.containerApi.addFloatingGroup(props.group, {
      position: { top: 100, left: 100 },
      width: 400,
      height: 300,
    });
  };

  const splitHorizontally = () => {
    props.containerApi.addGroup({
      referenceGroup: props.group,
      direction: "below",
    });
  };

  const splitVertically = () => {
    props.containerApi.addGroup({
      referenceGroup: props.group,
      direction: "right",
    });
  };

  const maximize = () => {
    props.activePanel?.api.maximize();
    setIsMaximized(true);
  };

  const minimize = () => {
    if (props.containerApi.hasMaximizedGroup()) {
      props.containerApi.exitMaximizedGroup();
    }
    setIsMaximized(false);
  };

  return (
    <div
      className="group-control"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0px 8px",
        height: "100%",
        color: "var(--dv-activegroup-hiddenpanel-tab-color)",
      }}
    >
      {!isMaximized && props.api.location.type == "grid" && (
        <>
          <Tooltip>
            <TooltipTrigger>
              <Columns2
                size={20}
                strokeWidth={2}
                name="Split Vertically"
                onClick={splitVertically}
                className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipContent>Split Vertically</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Rows2
                size={20}
                strokeWidth={2}
                name="Split Horizontally"
                onClick={splitHorizontally}
                className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipContent>Split Horizontally</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <PictureInPicture2
                size={20}
                strokeWidth={2}
                className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
                onClick={setFloat}
              />
            </TooltipTrigger>
            <TooltipContent>Pop Out</TooltipContent>
          </Tooltip>
        </>
      )}
      {props.panels.length > 0 &&
        (isMaximized ? (
          <Tooltip>
            <TooltipTrigger>
              <Minimize2
                size={20}
                strokeWidth={2}
                name="Minimize"
                onClick={minimize}
                className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipContent>Minimize Window</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <Maximize2
                size={20}
                strokeWidth={2}
                name="Maximize"
                onClick={maximize}
                className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipContent>Maximize Window</TooltipContent>
          </Tooltip>
        ))}
      <Tooltip>
        <TooltipTrigger>
          <X
            size={20}
            strokeWidth={2}
            name="Close"
            className="size-5 hover:text-red-500 cursor-pointer"
            onClick={() => props.containerApi.removeGroup(props.group)}
          />
        </TooltipTrigger>
        <TooltipContent>Close Group</TooltipContent>
      </Tooltip>
    </div>
  );
};
