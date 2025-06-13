import {
  DockviewReact,
  DockviewApi,
  type DockviewReadyEvent,
} from "dockview";
import { useState, useEffect } from "react";
import { DefaultPanel } from "@/components/DefaultPanel";

const components = {
  default: DefaultPanel,
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
