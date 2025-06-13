import {
  DockviewReact,
  DockviewApi,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
} from "dockview";

import { useState, useEffect } from "react";

const Default = (props: IDockviewPanelProps) => {
  return <div className="p-2">{props.api.title}</div>;
};

const components = {
  default: Default,
};

export function Dockview() {
  const [api, setApi] = useState<DockviewApi>();
  useEffect(() => {
    if (!api) return;

    api.addPanel({
      id: "panel_1",
      component: "default",
    });

    api.addPanel({
      id: "panel_2",
      component: "default",
      position: {
        direction: "right",
        referencePanel: "panel_1",
      },
    });

    api.addPanel({
      id: "panel_3",
      component: "default",
      position: {
        direction: "below",
        referencePanel: "panel_1",
      },
    });
    api.addPanel({
      id: "panel_4",
      component: "default",
    });
    api.addPanel({
      id: "panel_5",
      component: "default",
    });
  }, [api]);

  const onReady = (event: DockviewReadyEvent) => {
    setApi(event.api);
    (window as any).dockview = event.api;
  };

  return (
    <DockviewReact
      className={"dockview-theme-abyss"}
      onReady={onReady}
      components={components}
    />
  );
}
