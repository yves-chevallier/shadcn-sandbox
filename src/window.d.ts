import type { DockviewApi } from 'dockview';

declare global {
    interface Window {
        dockview: DockviewApi;
    }
}