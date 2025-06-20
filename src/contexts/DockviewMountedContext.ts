import { createContext, useEffect, useState, useCallback } from "react";
import type { DockviewApi } from "dockview";

export const MountedWidgetsContext = createContext<Set<string>>(new Set());

export function useMountedWidgets(api?: DockviewApi): Set<string> {
    const [mounted, setMounted] = useState<Set<string>>(new Set());

    const refresh = useCallback(() => {
        if (!api) return;
        setMounted(new Set(api.panels.map(p => p.id)));   // p.component === widget.id
    }, [api]);

    useEffect(() => {
        if (!api) return;
        refresh();
        const d1 = api.onDidAddPanel(refresh);
        const d2 = api.onDidRemovePanel(refresh);
        return () => { d1.dispose(); d2.dispose(); };
    }, [api, refresh]);

    return mounted;
}
