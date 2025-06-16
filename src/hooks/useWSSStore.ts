import { create } from 'zustand';
import { WebSocketManager, wsManager } from '@/websocketManager';

type State = {
  connected: boolean;
  values: Record<number, any>;
  connect: () => void;
  disconnect: () => void;
  subscribe: (...ids: number[]) => void;
  unsubscribe: (...ids: number[]) => void;
};

export const useWSStore = create<State>((set, get) => {
  let unsubscribeSdo: () => void;

  return {
    connected: false,
    values: {},

    connect: () => {
      wsManager.setStatusCallback((status) => {
        set({ connected: status === 'open' });
      });

      wsManager.connect('ws://localhost:8000/ws');

      unsubscribeSdo = wsManager.onMessage<Record<number, any>>('sdo', (payload) => {
        set((state) => ({
          values: { ...state.values, ...payload },
        }));
      });

      wsManager.send({ connect: true });
    },

    disconnect: () => {
      unsubscribeSdo?.();
      wsManager.disconnect();
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
  useWSStore((state) => state.values[id]);
