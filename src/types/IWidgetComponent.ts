import type { LucideIcon } from 'lucide-react';

export interface WidgetMetadata {
    title: string;
    icon: LucideIcon;
    widthMin: number;
    heightMin: number;
    settings?: () => React.ReactNode;
}
