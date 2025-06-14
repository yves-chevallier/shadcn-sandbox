import { DockviewReact, DockviewApi, type DockviewReadyEvent } from "dockview";
import { useState, useEffect } from "react";
import { DefaultPanel } from "@/components/DefaultPanel";
import { Tab, RightControls } from "@/components/controls";
import { Bookmark, Calculator, Carrot, ChefHat } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      params: {
        title: "Panel 1",
        icon: Bookmark,
        settings: (
          <div className="space-y-4">
            <Input placeholder="Nom" />
            <Input placeholder="Email" />
          </div>
        ),
      },
    });

    api.addPanel({
      id: "panel_2",
      component: "default",
      position: {
        direction: "right",
        referencePanel: "panel_1",
      },
      params: {
        title: "Panel 2",
        icon: Calculator,
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
      params: {
        title: "Panel 4",
        icon: Carrot,
      },
    });
    api.addPanel({
      id: "panel_5",
      component: "default",
      params: {
        title: "Panel 5",
        icon: ChefHat,
      },
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
