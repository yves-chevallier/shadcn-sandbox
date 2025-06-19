import type { ReactNode, FC } from 'react';
import type { IDockviewPanelProps } from 'dockview';
import type { LucideIcon } from "lucide-react";

export type GridUnit = 1 | 2 | 3 | 4;

export interface WidgetSettingsSpec {
    title: string;
    description?: string;
    SettingsComponent: FC;
}

export interface WidgetDefinition<S = unknown> {
    id: string;
    title: string;
    icon: LucideIcon;
    preferredSize?: { w: GridUnit; h: GridUnit };
    Content: WidgetComponent;
    Settings?: WidgetSettingsSpec;
    singleInstance?: boolean;
    initialState?: S;
}

export type WidgetPanelProps<S = unknown> = IDockviewPanelProps & {
    definition: WidgetDefinition<S>;
};

export type WidgetComponent<S = unknown> = FC<WidgetPanelProps<S>>;

/**
 * Helper that returns its argument unchanged but
 * preserves full type‑inference on generic parameters.
 */
export function defineWidget<S = unknown>(
    def: WidgetDefinition<S>,
): WidgetDefinition<S> {
    return def;
}
