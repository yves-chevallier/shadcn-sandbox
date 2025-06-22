import Clock from "react-clock";
import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import "react-clock/dist/Clock.css";
import "./clock.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClockStore } from "./clockStore";

export const ClockContent: FC = () => {
  const { label } = useClockStore();
  const [value, setValue] = useState(new Date());
  const [clockSize, setClockSize] = useState(200); // Valeur par défaut
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ResizeObserver to auto-fit the parent container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setClockSize(Math.min(width, height));
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const notification = () => {
    toast("Event has been created");
  };

  return (
    <div
      ref={containerRef}
      className="p-2 h-full w-full flex flex-col items-center justify-center"
    >
      <h2 className="mb-2 font-semibold text-lg">{label}</h2>
      <div
        style={{
          width: `${(clockSize * 2) / 3}px`,
          height: `${(clockSize * 2) / 3}px`,
        }}
      >
        <Clock
          size={(clockSize * 2) / 3}
          value={value}
          hourHandWidth={8}
          hourHandLength={60}
          minuteHandWidth={5}
          minuteHandLength={90}
          minuteMarksLength={4}
          minuteMarksWidth={2}
          hourMarksLength={18}
          hourMarksWidth={7}
          secondHandLength={75}
          secondHandWidth={3}
        />
      </div>
      <Button className="mt-4" onClick={notification}>
        Notification
      </Button>
    </div>
  );
};
