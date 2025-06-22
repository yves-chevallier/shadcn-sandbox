import { defineWidget } from "@/lib/widgets";
import { Clock as ClockIcon } from "lucide-react";
import { ClockContent } from "./ClockContent";
import { ClockSettings } from "./ClockSettings";

const ClockWidgetDefinition = defineWidget({
  id: "clock",
  title: "Horloge",
  icon: ClockIcon,
  preferredSize: { w: 1, h: 1 },
  Content: ClockContent,
  Settings: {
    title: "Paramètres de l'horloge",
    description: "Personnaliser le libellé.",
    SettingsComponent: ClockSettings,
  },
});

export { ClockWidgetDefinition as ClockWidget };
