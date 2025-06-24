import { useRef, useState, useCallback, useEffect } from "react";
import { cssVarToHex } from "./cssVarToHex";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import "./plot.css";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Move,
  Pause,
  Play,
  Eraser,
  FileDown,
  Eye,
  MoveVertical,
  MoveHorizontal,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import type { WidgetPanelProps } from "@/lib/widgets";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { set } from "zod";

const ToolButton: React.FC<{
  Icon: LucideIcon;
  description: string;
  onClick: () => void;
  state?: boolean; // For toggle buttons
  className?: string;
}> = ({ Icon, description, onClick, state, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`p-1 ${state ? "bg-muted" : ""}`}
          onClick={onClick}
        >
          <Icon className={`w-4 h-4  ${className}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{description}</TooltipContent>
    </Tooltip>
  );
};

type LegendEntry = {
  label: string;
  value: string;
  id: number;
  visible?: boolean;
};

function parseTimeInput(raw: string): number {
  const trimmed = raw.trim().toLowerCase();

  if (trimmed.endsWith("ms")) {
    return parseFloat(trimmed.replace("ms", "")) / 1000;
  }

  if (trimmed.endsWith("us") || trimmed.endsWith("µs")) {
    return parseFloat(trimmed.replace(/(us|µs)/, "")) / 1_000_000;
  }

  if (trimmed.endsWith("s")) {
    return parseFloat(trimmed.replace("s", ""));
  }

  // fallback: assume seconds
  return parseFloat(trimmed);
}

function formatTimeOutput(seconds: number): string {
  if (seconds >= 1) {
    return `${seconds.toFixed(2)} s`;
  } else if (seconds >= 1e-3) {
    return `${(seconds * 1e3).toFixed(1)} ms`;
  } else {
    return `${(seconds * 1e6).toFixed(0)} us`;
  }
}

export const PlotContent: React.FC<WidgetPanelProps> = ({ api }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [legend, setLegend] = useState<LegendEntry[]>([]);
  const [autoscaleX, setAutoscaleX] = useState(true);
  const [autoscaleY, setAutoscaleY] = useState(true);
  const autoscaleXRef = useRef(autoscaleX);
  const autoscaleYRef = useRef(autoscaleY);
  const timeWindowRef = useRef(5); // Default time window in seconds
  const [timeWindow, setTimeWindow] = useState(5); // Default time window in seconds
  const [timeRaw, setTimeRaw] = useState(formatTimeOutput(10));
  const plotRef = useRef<uPlot | null>(null);

  const MAX_POINTS = 20000;
  const { theme } = useTheme();
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const dataRef = useRef<[number[], number[], number[]]>([[], [], []]);

  const updateLegend = useCallback(() => {
    let frame: number | null = null;

    return (u: uPlot) => {
      if (frame !== null) return;

      frame = requestAnimationFrame(() => {
        frame = null;

        const idx = u.cursor.idx ?? null;
        const next: LegendEntry[] = [];

        if (idx != null) {
          const xVal = u.data[0][idx] as number;
          next.push({
            label: "Time",
            value: xVal.toFixed(3),
            id: -1,
          });
        }

        for (let s = 1; s < u.series.length; s++) {
          const serie = u.series[s];
          const y = idx != null ? (u.data[s][idx] as number | null) : null;

          next.push({
            label: String(serie.label ?? `S${s}`),
            value: y != null ? y.toFixed(3) : "",
            id: s,
            visible: serie.show ?? true,
          });
        }

        setLegend(next);
      });
    };
  }, []);

  /**
   * X Panning (dragging with left mouse)
   */
  function addPanX(u: uPlot) {
    let dragging = false;
    let startPx = 0;
    let x0 = 0,
      x1 = 0;

    const relX = (e: MouseEvent) => e.clientX - u.bbox.left;

    const onMouseDown = (e: MouseEvent): void => {
      if (e.button !== 0) return; // Left button only
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
        const newMinX = x0 + delta;
        const newMaxX = x1 + delta;
        const minDataX = u.data[0][0] ?? 0;
        const maxDataX = u.data[0][u.data[0].length - 1] ?? 0;
        if (newMinX < minDataX || newMaxX > maxDataX) return; // No change
        u.setScale("x", { min: newMinX, max: newMaxX });
        setAutoscaleX(false); // Disable autoscale on X
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
        x: { time: false, min: 0, max: 10 },
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
        show: false,
      },
      cursor: {
        drag: { x: true, y: true, uni: 50 },

        bind: {
          mousedown(u, _t, handler) {
            return (e) => {
              if (e.button === 2) {
                // éventuelle custom-logic
                u.root.style.cursor = "grabbing";
                handler(e); // ← toujours déléguer à uPlot
              }
            };
          },

          mousemove(_u, _t, handler) {
            return (e) => {
              handler(e); // indispensable pour cursor.idx
            };
          },

          mouseup(u, _t, handler) {
            return (e) => {
              handler(e);
              if (e.button === 2) u.root.style.cursor = "default";
            };
          },
        } as uPlot.Cursor.Bind,
      },

      hooks: {
        ready: [
          (u) => {
            // Disable right-click context menu
            u.root.addEventListener("contextmenu", (e) => e.preventDefault());
            u.hooks.setCursor ??= [];
            u.hooks.setCursor.push(updateLegend());
            addPanX(u);
          },
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
  }, [api, updateLegend]);

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
        setAutoscaleY(false); // Disable autoscale on Y
      } else {
        // Default: zoom on X axis
        if (!scales.x?.min || !scales.x?.max) return;

        const centerX = (scales.x.min + scales.x.max) / 2;
        const rangeX = (scales.x.max - scales.x.min) * factor;

        const newMinX = centerX - rangeX / 2;
        const newMaxX = centerX + rangeX / 2;

        plot.setScale("x", { min: newMinX, max: newMaxX });
        setTimeWindow(newMaxX - newMinX); // Update time window
        //setAutoscaleX(false); // Disable autoscale on X
      }
    };

    plot.root.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      plot.root.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    autoscaleXRef.current = autoscaleX;
  }, [autoscaleX]);

  useEffect(() => {
    autoscaleYRef.current = autoscaleY;
  }, [autoscaleY]);

  useEffect(() => {
    timeWindowRef.current = timeWindow;
  }, [timeWindow]);

  useEffect(() => {
    setTimeRaw(formatTimeOutput(timeWindow));
  }, [timeWindow]);

  // Mise à jour continue des données
  useEffect(() => {
    const start = performance.now();
    let rafId: number;

    const loop = () => {
      const plot = plotRef.current;
      if (!plot) return;
      if (!pausedRef.current) {
        const t = (performance.now() - start) / 1000;
        const y = Math.sin(t) + Math.sin(2 * t) + Math.sin(3.5 * t);
        const z = Math.sin(1.3 * t) + Math.sin(3.1 * t) + Math.sin(3 * t);

        const [xs, ys, zs] = dataRef.current;
        const newXs = [...xs, t].slice(-MAX_POINTS);
        const newYs = [...ys, y].slice(-MAX_POINTS);
        const newZs = [...zs, z].slice(-MAX_POINTS);
        dataRef.current = [newXs, newYs, newZs];

        plot.setData(dataRef.current);
        //plot.setScale("x", { min: 0, max: 10 });
        // const N = 500;
        // const len = newXs.length;
        // plotRef.current?.setScale("x", {
        //   min: newXs[len - N],
        //   max: newXs[len - 1],
        // });

        // If autoscale is enabled, adjust the Y scale

        // plot.scales.x.auto = autoscaleX;

        // plot.scales.y.auto = autoscaleY;

        if (autoscaleY) {
          const yValues = [...newYs, ...newZs].filter((v) =>
            Number.isFinite(v)
          );
          const minY = Math.min(...yValues);
          const maxY = Math.max(...yValues);
          plot.setScale("y", { min: minY, max: maxY });
        }

        if (autoscaleXRef.current) {
          const len = newXs.length;
          const lastValue = newXs[len - 1] ?? 0;
          plot.setScale("x", {
            min: lastValue - timeWindowRef.current,
            max: lastValue,
          });
        }
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

  const toggleSerie = (id: number) => {
    const plot = plotRef.current;
    if (!plot) return;
    const current = plot.series[id].show ?? true;
    plot.setSeries(id, { show: !current });
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
            Icon={paused ? Pause : Play}
            description={paused ? "Resume" : "Pause"}
            className={paused ? "text-yellow-400" : "text-green-400"}
            onClick={togglePause}
          />
          <ToolButton
            Icon={Eraser}
            description="Clear buffer"
            className="text-red-400"
            onClick={clear}
          />
          <ToolButton
            Icon={FileDown}
            description="Download"
            onClick={download}
          />
          <ToolButton
            Icon={MoveVertical}
            description="AutoScale Y"
            onClick={() => setAutoscaleY((prev) => !prev)}
            state={autoscaleY}
          />
          <ToolButton
            Icon={MoveHorizontal}
            description="AutoScale X"
            onClick={() => setAutoscaleX((prev) => !prev)}
            state={autoscaleX}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Eye className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">Dimensions</h4>
                  <p className="text-muted-foreground text-sm">
                    Set the dimensions for the layer.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      defaultValue="100%"
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="maxWidth">Max. width</Label>
                    <Input
                      id="maxWidth"
                      defaultValue="300px"
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      defaultValue="25px"
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="maxHeight">Max. height</Label>
                    <Input
                      id="maxHeight"
                      defaultValue="none"
                      className="col-span-2 h-8"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="p-2 pl-5 h-10 flex-shrink-0 w-full border-t px-2 text-sm flex items-center">
        Status&nbsp;: Ready.
        <div className="ml-auto flex items-center space-x-1">
          <Input
            type="text"
            placeholder="Time Window"
            className="h-7 text-right w-24"
            value={timeRaw}
            onChange={(e) => {
              const input = e.target.value;
              setTimeRaw(input);
              const parsed = parseTimeInput(input);
              if (!isNaN(parsed)) {
                setTimeWindow(parsed);
              }
            }}
            onBlur={() => {
              setTimeRaw(formatTimeOutput(timeWindow)); // clean display on blur
            }}
          />

          {legend.map(({ label, value, id, visible }) => {
            const varName = `--chart-${id + 1}`;
            return (
              <Badge
                key={label}
                variant="outline"
                className="border ml-1 px-1.5 text-sm flex items-center"
                style={{
                  borderColor: `var(${varName})`,
                  backgroundColor: `color-mix(in srgb, var(${varName}) 18%, transparent)`,
                  opacity: visible ? 1 : 0.35, // visuel « masqué »
                }}
              >
                {id > 0 && (
                  <span
                    className="inline-block w-2 h-2 rounded-sm mr-1"
                    style={{ backgroundColor: `var(${varName})` }}
                  />
                )}
                <span className="tabular-nums mr-1">
                  {label} {value}
                </span>
                {visible !== undefined && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // évite de cliquer sur le badge
                      toggleSerie(id);
                    }}
                    className="ml-1 flex items-center hover:opacity-80 focus:outline-none"
                  >
                    {visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};
