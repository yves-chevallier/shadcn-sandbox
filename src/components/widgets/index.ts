import type { WidgetDefinition } from '@/lib/widgets';

const modules = import.meta.glob<
  true,
  string,
  { default: WidgetDefinition }
>('./**/*.tsx', { eager: true });

export const widgetRegistry: Record<string, WidgetDefinition> = {};

for (const path in modules) {
  const widget = modules[path].default;
  if (__DEV__ && widgetRegistry[widget.id])
    throw new Error(`Duplicate widget id: “${widget.id}”.`);
  widgetRegistry[widget.id] = widget;
}
