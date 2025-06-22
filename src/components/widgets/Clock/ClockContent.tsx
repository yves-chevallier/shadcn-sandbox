import Clock from "react-clock";
import { useState, useEffect } from "react";
import type { FC } from "react";
import "react-clock/dist/Clock.css";
import "./clock.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClockStore } from "./clockStore";

export const ClockContent: FC = () => {
  const { label } = useClockStore();
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const notification = () => {
    toast("Event has been created");
  };
  return (
    <div className="p-2">
      <h2 className="mb-2 font-semibold text-lg">{label}</h2>
      <Clock
        size={200}
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
      <Button onClick={notification}>Notification</Button>
    </div>
  );
};
