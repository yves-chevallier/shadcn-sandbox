import { useEffect, useRef } from 'react';
import type { PanelApi } from 'dockview';
import { widgetRegistry } from '@/components/widgets';
import type { WidgetContext } from '@/lib/widgets';

export function useDockviewWidget(
  panel: PanelApi,
  widgetId: string,
  ctx: WidgetContext,
) {
  const widget = widgetRegistry[widgetId];
  const mounted = useRef(false);

  useEffect(() => {
    if (!widget) return;

    panel.setTitle(widget.title);
    panel.setIcon(widget.icon);
    panel.setPreferredSize?.(widget.preferredSize);

    if (!mounted.current && widget.onMount) {
      widget.onMount(ctx);
      mounted.current = true;
    }
    return () => {
      if (mounted.current && widget.onUnmount) {
        widget.onUnmount(ctx);
        mounted.current = false;
      }
    };
  }, [panel, widget, ctx]);

  return widget;
}
