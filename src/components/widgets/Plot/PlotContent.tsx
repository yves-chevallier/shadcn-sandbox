import { useRef, useState, useCallback, useEffect } from "react";
import { cssVarToHex } from "./cssVarToHex";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import "./plot.css";
import { useTheme } from "@/hooks/useTheme";

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

/**  PanXPlugin : déplacement horizontal au bouton gauche  */
function addPanX(u: uPlot) {
  let dragging = false;
  let startPx = 0;
  let x0 = 0,
    x1 = 0;

  const relX = (e: MouseEvent) => e.clientX - u.bbox.left;

  const onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return; // gauche uniquement
    dragging = true;

    startPx = relX(e);
    const { min = 0, max = 0 } = u.scales.x as Required<uPlot.Scale>;
    x0 = min;
    x1 = max;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    u.root.style.cursor = "grabbing";
  };

  const onMouseMove = (e: MouseEvent): void => {
    if (!dragging) return;

    const dxPx = relX(e) - startPx;
    const delta = u.posToVal(0, "x") - u.posToVal(dxPx, "x");

    u.batch(() => {
      u.setScale("x", { min: x0 + delta, max: x1 + delta });
    });
  };

  const onMouseUp = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    dragging = false;

    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    u.root.style.cursor = "default";
  };

  u.root.addEventListener(
    "mousedown",
    onMouseDown as uPlot.Cursor.MouseListener
  );
}

export const PlotContent: React.FC<WidgetPanelProps> = ({ api }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);

  const plotRef = useRef<uPlot | null>(null);

  const MAX_POINTS = 20000;
  const { theme } = useTheme();
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
      legend: {
        mount(_uPlot, el) {
          legendRef.current?.appendChild(el);
        },
      },
      cursor: {
        // on conserve vos paramètres actuels
        drag: { x: true, y: true, uni: 50 },

        // réécriture sélective des écouteurs souris
        bind: {
          mousedown(u, _targ, handler) {
            return (e) => {
              if (e.button === 2) {
                handler(e); // zoom-select standard
                u.root.style.cursor = "grabbing";
              }
            };
          },

          mousemove(_u, _targ, handler) {
            return (e) => {
              if (e.buttons === 2) handler(e);
            };
          },

          mouseup(u, _targ, handler) {
            return (e) => {
              if (e.button === 2) {
                handler(e);
                u.root.style.cursor = "default";
              }
            };
          },
        } as uPlot.Cursor.Bind, // ← le cast qui lève l’ambiguïté
      },

      hooks: {
        ready: [
          (u) => {
            // Disable right-click context menu
            u.root.addEventListener("contextmenu", (e) => e.preventDefault());
          },
          (u) => addPanX(u),
        ],
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

  useEffect(() => {
    const data = dataRef.current;

    plotRef.current?.destroy();
    plotRef.current = null;

    const destroy = createPlot();

    (plotRef.current as uPlot | null)?.setData(data);

    return destroy;
  }, [theme, createPlot]);

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
        // const N = 500;
        // const len = newXs.length;
        // plotRef.current?.setScale("x", {
        //   min: newXs[len - N],
        //   max: newXs[len - 1],
        // });
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
    <div className="flex flex-col h-full w-full min-h-0">
      {" "}
      {/* ← ajout min-h-0 */}
      <div className="flex flex-1 min-h-0 p-2 space-x-2">
        {" "}
        {/* ← idem */}
        <div ref={containerRef} className="flex-1 min-w-0 h-full" />
        <div className="w-[30px] flex flex-col items-center gap-2">
          <ToolButton
            Icon={paused ? Play : Pause}
            description={paused ? "Resume" : "Pause"}
            onClick={togglePause}
          />
          <ToolButton
            Icon={Eraser}
            description="Clear buffer"
            onClick={clear}
          />
          <ToolButton Icon={ZoomIn} description="Zoom In" onClick={() => {}} />
          <ToolButton
            Icon={ZoomOut}
            description="Zoom Out"
            onClick={() => {}}
          />
          <ToolButton Icon={Move} description="Move" onClick={() => {}} />
          <ToolButton
            Icon={FileDown}
            description="Download"
            onClick={download}
          />
        </div>
      </div>
      <div className="mt-1 ml-2 h-8 flex-shrink-0 w-full border-t px-2 text-sm flex items-center">
        Status&nbsp;: Ready.
        <div ref={legendRef} className="ml-auto flex items-right"></div>
      </div>
    </div>
  );
};
