import { create } from "zustand";

interface ClockState {
    label: string;
    setLabel: (s: string) => void;
}

export const useClockStore = create<ClockState>()((set) => ({
    label: "Horloge",
    setLabel: (label) => set({ label }),
}));