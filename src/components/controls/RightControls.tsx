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

export const RightControls = (props: IDockviewHeaderActionsProps) => {
  const [isMaximized, setIsMaximized] = React.useState<boolean>(
    props.containerApi.hasMaximizedGroup()
  );

  const [isPopout, setIsPopout] = React.useState<boolean>(
    props.api.location.type === "popout"
  );

  React.useEffect(() => {
    const disposable = props.containerApi.onDidMaximizedGroupChange(() => {
      setIsMaximized(props.containerApi.hasMaximizedGroup());
    });

    const disposable2 = props.api.onDidLocationChange(() => {
      setIsPopout(props.api.location.type === "popout");
    });

    return () => {
      disposable.dispose();
      disposable2.dispose();
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
      {props.api.location.type == "grid" && (
        <>
          <Columns2
            size={20}
            strokeWidth={2}
            name="Split Vertically"
            onClick={splitVertically}
            className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
          />
          <Rows2
            size={20}
            strokeWidth={2}
            name="Split Horizontally"
            onClick={splitHorizontally}
            className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
          />
          <PictureInPicture2
            size={20}
            strokeWidth={2}
            className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
            onClick={setFloat}
          />
          {props.panels.length > 0 &&
            (isMaximized ? (
              <Minimize2
                size={20}
                strokeWidth={2}
                name="Minimize"
                onClick={minimize}
                className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
              />
            ) : (
              <Maximize2
                size={20}
                strokeWidth={2}
                name="Maximize"
                onClick={maximize}
                className="mr-2 size-5 hover:text-secondary-foreground cursor-pointer"
              />
            ))}
        </>
      )}
      <X
        size={20}
        strokeWidth={2}
        name="Close"
        className="size-5 hover:text-red-500 cursor-pointer"
        onClick={() => props.containerApi.removeGroup(props.group)}
      />
    </div>
  );
};
