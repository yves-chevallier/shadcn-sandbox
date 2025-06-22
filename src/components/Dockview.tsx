import { DockviewReact, DockviewApi, type DockviewReadyEvent } from "dockview";
import { useState, useEffect, useMemo } from "react";
import { Tab, RightControls } from "@/components/controls";
import { widgetRegistry, toDockviewComponents } from "@/components/widgets";

export function Dockview() {
  const [api, setApi] = useState<DockviewApi>();

  const components = useMemo(() => toDockviewComponents(), []);

  useEffect(() => {
    if (!api) return;

    const onDidAddPanel = api.onDidAddPanel((event) => {
      console.log("Panel added:", event.id);
    });
    const onDidRemovePanel = api.onDidRemovePanel((event) => {
      console.log("Panel removed:", event.id);
    });

    for (const [id, widget] of widgetRegistry.entries()) {
      api.addPanel({
        id: id,
        component: id,
        title: widget.title,
      });
    }

    return () => {
      onDidAddPanel.dispose();
      onDidRemovePanel.dispose();
    };
  }, [api]);

  const onReady = (event: DockviewReadyEvent) => {
    setApi(event.api);
    (window as unknown as Window).dockview = event.api;
  };

  return (
    <DockviewReact
      className={"dockview-theme-abyss"}
      onReady={onReady}
      defaultTabComponent={Tab}
      rightHeaderActionsComponent={RightControls}
      components={components}
    />
  );
}
