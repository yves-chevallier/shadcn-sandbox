import { defineWidget } from "@/lib/widgets";
import { ChartSpline } from "lucide-react";
import { PlotContent } from "./PlotContent";

const PlotWidget = defineWidget({
  id: "plot",
  title: "Plot",
  icon: ChartSpline,
  preferredSize: { w: 2, h: 1 },
  Content: PlotContent,
});

export { PlotWidget, PlotContent };
