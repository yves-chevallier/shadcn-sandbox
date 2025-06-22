import { defineMock } from 'vite-plugin-mock-dev-server';
import type { WebSocket, WebSocketServer, RawData } from 'ws';

console.log('[mock] LOADED');

export default defineMock({
  url: '/ws/echo',
  ws: true,
  setup(wss: WebSocketServer) {
    console.log('[mock] Setting up /ws/echo');
    wss.on('connection', (ws: WebSocket) => {
      console.log('[mock] WebSocket client connected');
      ws.send(JSON.stringify({ type: 'ready' }));
      ws.on('message', (msg: RawData) => {
        console.log('[mock] Received:', msg.toString());
        ws.send(JSON.stringify({ type: 'echo', payload: msg.toString() }));
      });
    });
  },
});