import type { WidgetDefinition, WidgetPanelProps } from "@/lib/widgets";
import type { FC } from "react";
import type { IDockviewPanelProps } from "dockview";
import { useEffect, createElement } from "react";

const modules = {
  ...import.meta.glob("./*/index.tsx", { eager: true }),
  ...import.meta.glob("./*/index.ts", { eager: true }),
} as Record<string, Record<string, WidgetDefinition>>;

export const widgetRegistry = new Map<string, WidgetDefinition>();

for (const [path, mod] of Object.entries(modules)) {
  const widgetEntry = Object.entries(mod).find(([k]) =>
    k.endsWith("Widget")
  );

  if (!widgetEntry) {
    console.warn(`⚠️ Aucun export nommé se terminant par “Widget” dans ${path}`);
    continue;
  }

  const [name, widget] = widgetEntry;

  if (!widget.id) {
    console.warn(`⚠️ Le widget “${name}” dans "${path}" est invalide.`);
    continue;
  }

  if (widgetRegistry.has(widget.id)) {
    throw new Error(`Duplicate widget id: “${widget.id}”.`);
  }

  widgetRegistry.set(widget.id, widget);
}

export function toDockviewComponents(): Record<
  string,
  FC<IDockviewPanelProps>
> {
  const entries = [...widgetRegistry.values()].map((widget) => {
    const Wrapped: FC<IDockviewPanelProps> = (props) => {
      const fullProps: WidgetPanelProps = {
        ...props,
        definition: widget,
      };

      const { title, icon, Settings } = widget;

      useEffect(() => {
        props.api.setTitle(title);
        props.api.updateParameters({
          title,
          icon,
          settings: widget.Settings?.SettingsComponent,
        });
      }, [props.api, title, icon, Settings]);

      return createElement(widget.Content, fullProps);
    };
    return [widget.id, Wrapped];
  });

  return Object.fromEntries(entries);
}
