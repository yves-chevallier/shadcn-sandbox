import { DockviewReact, DockviewApi, type DockviewReadyEvent } from "dockview";
import { useState, useEffect, useMemo } from "react";
import { Tab, RightControls } from "@/components/controls";
import { widgetRegistry, toDockviewComponents } from "@/components/widgets";

export function Dockview() {
  const [api, setApi] = useState<DockviewApi>();

  const components = useMemo(() => toDockviewComponents(), []);

  useEffect(() => {
    if (!api) return;
    const widget = widgetRegistry.get("clock");
    if (!widget) return;
    api.addPanel({
      id: widget.id,
      component: widget.id,
      title: widget.title,
    });
    api.addPanel({
      id: `${widget.id}1`,
      component: widget.id,
      title: widget.title,
    });
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
