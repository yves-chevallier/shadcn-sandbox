import type { ReactNode, FC } from 'react';

export interface WidgetContext {
  subscribe<T = unknown>(key: string, cb: (value: T) => void): () => void;
  useStore: <T = unknown>(selector: (s: any) => T) => T;
}

export interface WidgetDefinition {

  id: string;
  title: string;
  icon: ReactNode;
  preferredSize: { w: number; h: number };
  Settings?: FC<{ ctx: WidgetContext }>;
  Content: FC<{ ctx: WidgetContext }>;

  onMount?: (ctx: WidgetContext) => void;
  onUnmount?: (ctx: WidgetContext) => void;
}

export function defineWidget<const T extends WidgetDefinition>(widget: T): T {
  return widget;
}
