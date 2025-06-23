import { useRef, useState, useCallback, useEffect } from "react";
import { cssVarToHex } from "./cssVarToHex";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import "./plot.css";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Move,
  Pause,
  Play,
  Eraser,
  FileDown,
  type LucideIcon,
} from "lucide-react";
import type { WidgetPanelProps } from "@/lib/widgets";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ToolButton: React.FC<{
  Icon: LucideIcon;
  description: string;
  onClick: () => void;
}> = ({ Icon, description, onClick }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="p-1" onClick={onClick}>
          <Icon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{description}</TooltipContent>
    </Tooltip>
  );
};

export const PlotContent: React.FC<WidgetPanelProps> = ({ api }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const MAX_POINTS = 500;

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

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
        {
          label: "Y",
          stroke: chartColor,
          width: 2,
          points: { space: 9, fill: chartColor, size: 6 },
        },
        {
          label: "Z",
          stroke: chartColor2,
          width: 2,
          points: { space: 9, fill: chartColor2, size: 6 },
        },
      ],

      cursor: {
        // Selection box (omni + adaptative)
        drag: { x: true, y: true, uni: 50 },
      },
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

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Force pause
      pausedRef.current = true;
      setPaused(true);

      const factor = e.deltaY < 0 ? 0.9 : 1.1;
      const scales = plot.scales;
      if (!scales) return;

      // CTRL key pressed → zoom on Y axis
      if (e.ctrlKey) {
        if (!scales.y?.min || !scales.y?.max) return;

        const centerY = (scales.y.min + scales.y.max) / 2;
        const rangeY = (scales.y.max - scales.y.min) * factor;

        const newMinY = centerY - rangeY / 2;
        const newMaxY = centerY + rangeY / 2;

        plot.setScale("y", { min: newMinY, max: newMaxY });
      } else {
        // Default: zoom on X axis
        if (!scales.x?.min || !scales.x?.max) return;

        const centerX = (scales.x.min + scales.x.max) / 2;
        const rangeX = (scales.x.max - scales.x.min) * factor;

        const newMinX = centerX - rangeX / 2;
        const newMaxX = centerX + rangeX / 2;

        plot.setScale("x", { min: newMinX, max: newMaxX });
      }
    };

    plot.root.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      plot.root.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Mise à jour continue des données
  useEffect(() => {
    const start = performance.now();
    let rafId: number;

    const loop = () => {
      if (!pausedRef.current) {
        const t = (performance.now() - start) / 1000;
        const y = Math.sin(t) + Math.sin(2 * t) + Math.sin(3.5 * t);
        const z = Math.sin(1.3 * t) + Math.sin(3.1 * t) + Math.sin(3 * t);

        const [xs, ys, zs] = dataRef.current;
        const newXs = [...xs, t].slice(-MAX_POINTS);
        const newYs = [...ys, y].slice(-MAX_POINTS);
        const newZs = [...zs, z].slice(-MAX_POINTS);
        dataRef.current = [newXs, newYs, newZs];

        plotRef.current?.setData(dataRef.current);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const togglePause = () => {
    setPaused((prev) => {
      pausedRef.current = !prev;
      return !prev;
    });
  };

  const clear = () => {
    dataRef.current = [[], [], []];
  };

  const download = () => {
    if (!plotRef.current) return;

    const csvContent = dataRef.current.map((arr) => arr.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plot_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full p-2 space-x-2">
      <div ref={containerRef} className="flex-1 min-w-0  h-full" />
      <div className="w-[30px] flex flex-col items-center justify-start gap-2">
        <ToolButton
          Icon={paused ? Play : Pause}
          description={paused ? "Resume" : "Pause"}
          onClick={togglePause}
        />
        <ToolButton Icon={Eraser} description="Clear buffer" onClick={clear} />
        <ToolButton Icon={ZoomIn} description="Zoom In" onClick={() => {}} />
        <ToolButton Icon={ZoomOut} description="Zoom Out" onClick={() => {}} />
        <ToolButton Icon={Move} description="Move" onClick={() => {}} />
        <ToolButton Icon={FileDown} description="Download" onClick={download} />
      </div>
    </div>
  );
};
