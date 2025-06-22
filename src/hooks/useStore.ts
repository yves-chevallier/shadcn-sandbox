import { create } from 'zustand';
import { wsManager } from '@/lib/websocketManager';

type State = {
    connected: boolean;
    values: Record<number, unknown>;
    connect: () => void;
    disconnect: () => void;
    subscribe: (...ids: number[]) => void;
    unsubscribe: (...ids: number[]) => void;
};

export const useStore = create<State>((set, get) => {
    let unsubscribeSdo: () => void;

    return {
        connected: false,
        values: {},

        connect: () => {
            // set({ connected: true });
            wsManager.setStatusCallback((status) => {
                set({ connected: status === 'open' });
            });

            wsManager.connect('ws://localhost:5173/ws/echo');

            unsubscribeSdo = wsManager.onMessage<Record<number, unknown>>('sdo', (payload) => {
                set((state) => ({
                    values: { ...state.values, ...payload },
                }));
            });

            wsManager.send({ connect: true });
        },

        disconnect: () => {
            // unsubscribeSdo?.();
            // wsManager.disconnect();
            set({ connected: false });
        },

        subscribe: (...ids: number[]) => {
            wsManager.send({ subscribe: ids });
        },

        unsubscribe: (...ids: number[]) => {
            wsManager.send({ unsubscribe: ids });
        }

    };
});

export const useWSValue = (id: number) =>
    useStore((state) => state.values[id]);
