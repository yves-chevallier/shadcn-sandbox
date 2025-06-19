import type { WidgetDefinition, WidgetPanelProps } from "@/lib/widgets";
import type { FC } from "react";
import type { IDockviewPanelProps } from "dockview";
import { useEffect, createElement } from "react";

const modules = import.meta.glob<true, string, { default: WidgetDefinition }>(
  "./**/*.tsx",
  { eager: true }
);

export const widgetRegistry = new Map<string, WidgetDefinition>();

for (const [path, mod] of Object.entries(modules)) {
  const widget = mod?.default;

  if (!widget) {
    console.warn(
      `⚠️ Le fichier "${path}" n'a pas de widget par défaut exporté.`
    );
    continue;
  }

  if (!widget.id) {
    console.warn(`⚠️ Le widget dans "${path}" est invalide (pas de 'id').`);
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

      // Inject metadata into Dockview panel API
      useEffect(() => {
        props.api.setTitle(widget.title);
        props.api.updateParameters({
          title: widget.title,
          icon: widget.icon,
          settings: widget.Settings?.SettingsComponent,
        });
      }, []);

      return createElement(widget.Content, fullProps);
    };
    return [widget.id, Wrapped];
  });

  return Object.fromEntries(entries);
}
