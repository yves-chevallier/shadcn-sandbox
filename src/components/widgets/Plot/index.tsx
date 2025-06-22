import { defineWidget } from "@/lib/widgets";
import { ChartSpline } from "lucide-react";
import { useState, useRef, useEffect, createContext, useContext } from "react";
import { cssVarToHex } from "./cssVarToHex";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import "./plot.css";

const PlotContext = createContext<{
  label: string;
  setLabel: (label: string) => void;
} | null>(null);

const MAX_POINTS = 500;

export const InnerPlotWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const [data, setData] = useState<[number[], number[]]>([[], []]);

  useEffect(() => {
    let start = performance.now();
    let rafId: number;

    const loop = () => {
      const t = (performance.now() - start) / 1000;
      const y = Math.sin(t) + Math.sin(2 * t) + Math.sin(3.5 * t);

      setData(([xs, ys]) => {
        const newXs = [...xs, t].slice(-MAX_POINTS);
        const newYs = [...ys, y].slice(-MAX_POINTS);
        return [newXs, newYs];
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Création initiale du graphique
  useEffect(() => {
    if (!containerRef.current || plotRef.current) return;

    const axisColor = cssVarToHex("--foreground");
    const gridColor = cssVarToHex("--border");
    const chartColor = cssVarToHex("--chart-2");

    plotRef.current = new uPlot(
      {
        width: containerRef.current.clientWidth,
        height: 200,
        scales: {
          x: { time: false },
          y: {},
        },
        series: [
          {},
          {
            label: "Signal",
            stroke: chartColor,
            width: 2,
          },
        ],
        axes: [
          {
            stroke: axisColor,
            grid: { stroke: gridColor },
            ticks: { stroke: axisColor },
          },
          {
            stroke: axisColor,
            grid: { stroke: gridColor },
            ticks: { stroke: axisColor },
          },
        ],
      },
      data,
      containerRef.current
    );

    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, []);

  // Mise à jour des données
  useEffect(() => {
    if (plotRef.current) {
      plotRef.current.setData(data);
    }
  }, [data]);

  return <div ref={containerRef} className="w-full h-full p-2" />;
};

const PlotSettings: React.FC = () => {
  const ctx = useContext(PlotContext);
  if (!ctx) return null;

  return (
    <input
      value={ctx.label}
      onChange={(e) => ctx.setLabel(e.target.value)}
      className="border p-1 rounded"
    />
  );
};

function PlotContent() {
  const [label, setLabel] = useState("Horloge");

  return (
    <PlotContext.Provider value={{ label, setLabel }}>
      <InnerPlotWidget />
    </PlotContext.Provider>
  );
}

export const PlotWidget = defineWidget({
  id: "plot",
  title: "Plot",
  icon: ChartSpline,
  preferredSize: { w: 1, h: 1 },
  Content: PlotContent,
  Settings: {
    title: "Plot Settings",
    description: "Personnaliser le libellé.",
    SettingsComponent: PlotSettings,
  },
});

export default PlotWidget;
