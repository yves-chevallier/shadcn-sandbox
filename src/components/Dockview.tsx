import {
  DockviewReact,
  DockviewApi,
  positionToDirection,
  type DockviewReadyEvent,
  type DockviewDidDropEvent,
} from "dockview";
import { useState, useEffect, useMemo } from "react";
import { Tab, RightControls } from "@/components/controls";
import { widgetRegistry, toDockviewComponents } from "@/components/widgets";

export function Dockview() {
  const [api, setApi] = useState<DockviewApi>();

  const components = useMemo(() => toDockviewComponents(), []);

  useEffect(() => {
    if (!api) return;

    const disposableDragOver = api.onUnhandledDragOverEvent((evt) => {
      if (
        evt.nativeEvent.dataTransfer?.types.includes("application/x-widget-id")
      ) {
        evt.accept(); // déclenche l’overlay bleu
      }
    });

    const disposableDrop = api.onDidDrop((evt: DockviewDidDropEvent) => {
      const id = evt.nativeEvent.dataTransfer?.getData(
        "application/x-widget-id"
      );
      if (!id || !widgetRegistry.has(id)) return;

      const widget = widgetRegistry.get(id)!;

      api.addPanel({
        id: `${id}-${Date.now()}`,
        component: id,
        title: widget.title,
        position: {
          referenceGroup: evt.group ?? undefined,
          direction: positionToDirection(evt.position),
        },
      });
    });

    const onDidAddPanel = api.onDidAddPanel((event) => {
      //console.log("Panel added:", event.id);
    });
    const onDidRemovePanel = api.onDidRemovePanel((event) => {
      //console.log("Panel removed:", event.id);
    });

    // for (const [id, widget] of widgetRegistry.entries()) {
    //   api.addPanel({
    //     id: id,
    //     component: id,
    //     title: widget.title,
    //   });
    // }
    const w = widgetRegistry.get("plot");
    api.addPanel({
      id: w.id,
      component: w.id,
      title: w?.title,
    });

    return () => {
      onDidAddPanel.dispose();
      onDidRemovePanel.dispose();
      disposableDragOver.dispose();
      disposableDrop.dispose();
    };
  }, [api]);

  const onReady = ({ api }: DockviewReadyEvent) => {
    setApi(api);
    window.dockview = api;
  };

  return (
    <DockviewReact
      className="dockview-theme-abyss"
      components={components}
      onReady={onReady}
      defaultTabComponent={Tab}
      rightHeaderActionsComponent={RightControls}
      dndEdges={{
        size: { value: 100, type: "pixels" },
        activationSize: { value: 5, type: "percentage" },
      }}
    />
  );
}
