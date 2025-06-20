import { defineWidget } from "@/lib/widgets";
import { Clock as ClockIcon } from "lucide-react";
import Clock from "react-clock";
import { useState, useEffect, createContext, useContext } from "react";
import type { FC } from "react";
import "react-clock/dist/Clock.css";
import "./clock.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ClockContext = createContext<{
  label: string;
  setLabel: (label: string) => void;
} | null>(null);

const InnerClockWidget: FC = () => {
  const ctx = useContext(ClockContext);
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

const ClockSettings: FC = () => {
  const ctx = useContext(ClockContext);
  if (!ctx) return null;

  return (
    <input
      value={ctx.label}
      onChange={(e) => ctx.setLabel(e.target.value)}
      className="border p-1 rounded"
    />
  );
};

function ClockContent() {
  const [label, setLabel] = useState("Horloge");

  return (
    <ClockContext.Provider value={{ label, setLabel }}>
      <InnerClockWidget />
    </ClockContext.Provider>
  );
}

export const ClockWidget = defineWidget({
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

export default ClockWidget;
