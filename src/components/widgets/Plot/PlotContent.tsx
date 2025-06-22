import { useRef, useCallback, useEffect } from "react";
import { cssVarToHex } from "./cssVarToHex";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import "./plot.css";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import type { WidgetPanelProps } from "@/lib/widgets";

export const PlotContent: React.FC<WidgetPanelProps> = ({ api }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const MAX_POINTS = 500;

  const dataRef = useRef<[number[], number[], number[]]>([[], [], []]);

  const createPlot = useCallback(() => {
    const container = containerRef.current;
    if (!container || !api) return;

    const axisColor = cssVarToHex("--foreground");
    const gridColor = cssVarToHex("--border");
    const chartColor = cssVarToHex("--chart-2");
    const chartColor2 = cssVarToHex("--chart-3");

    const options: uPlot.Options = {
      width: container.clientWidth,
      height: container.clientHeight,
      scales: {
        x: { time: false },
        y: {},
      },
      series: [
        {},
        { label: "Y", stroke: chartColor, width: 2 },
        { label: "Z", stroke: chartColor2, width: 2 },
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
    };

    plotRef.current = new uPlot(options, dataRef.current, container);

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      plotRef.current?.setSize({ width, height });
    };

    const disposable = api.onDidDimensionsChange(() => {
      requestAnimationFrame(handleResize);
    });

    return () => {
      disposable.dispose();
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [api]);

  // Initialisation du graphique
  useEffect(() => {
    if (!containerRef.current) return;
    const destroy = createPlot();
    return destroy;
  }, [createPlot]);

  // Mise à jour continue des données
  useEffect(() => {
    const start = performance.now();
    let rafId: number;

    const loop = () => {
      const t = (performance.now() - start) / 1000;
      const y = Math.sin(t) + Math.sin(2 * t) + Math.sin(3.5 * t);
      const z = Math.sin(1.3 * t) + Math.sin(3.1 * t) + Math.sin(3 * t);

      const [xs, ys, zs] = dataRef.current;
      const newXs = [...xs, t].slice(-MAX_POINTS);
      const newYs = [...ys, y].slice(-MAX_POINTS);
      const newZs = [...zs, z].slice(-MAX_POINTS);
      dataRef.current = [newXs, newYs, newZs];

      if (plotRef.current) {
        plotRef.current.setData(dataRef.current);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="flex h-full w-full p-2 space-x-2">
      <div ref={containerRef} className="flex-1 min-w-0  h-full" />
      <div className="w-[30px] flex flex-col items-center justify-start gap-2">
        <Button variant="ghost" size="icon" className="p-1">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="p-1">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="p-1">
          <Move className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
