import { useClockStore } from "./clockStore";
import type { FC } from "react";

export const ClockSettings: FC = () => {
  const { label, setLabel } = useClockStore();

  return (
    <input
      value={label}
      onChange={(e) => setLabel(e.target.value)}
      className="border p-1 rounded"
    />
  );
};
