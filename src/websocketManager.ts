/**
 * WebSocketManager is a utility class for managing WebSocket connections,
 *
 * - Zod validation for messages
 * - Event handling for messages with EventEmitter
 * - Decoupled UI logic from transport logic with useWebSocket hook
 * - Typed message handling with TypeScript via BaseMessage
 * - Clean listeners management (unsubscribe + clear)
 * - Callback injection: onClose, onMessage
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import { z } from 'zod';

type Command = { [key: string]: any };
type MessageCallback = (msg: any) => void;
type TypedCallback = (msg: any) => void;
type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'reconnecting' | 'error';

/**
 * From Python side, we can export a Zod schema for the base message type.
 *
 * from pydantic import BaseModel
 *  from pydantic_zod import zod_model
 *  class BaseMessage(BaseModel):
 *      type: str
 *      payload: dict
 *  print(zod_model(BaseMessage))
 */
export const BaseMessageSchema = z.object({
    type: z.string(),
    payload: z.any()
});

export type BaseMessage = z.infer<typeof BaseMessageSchema>;

class EventEmitter<T> {
    private listeners = new Map<string, Set<(payload: T) => void>>();

    on(event: string, listener: (payload: T) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);
        return () => {
            this.listeners.get(event)!.delete(listener);
        };
    }

    emit(event: string, payload: T) {
        this.listeners.get(event)?.forEach(listener => listener(payload));
    }

    clear() {
        this.listeners.clear();
    }
}

export class WebSocketManager {
    private socket: WebSocket | null = null;
    private emitter = new EventEmitter<any>();
    private onClose?: () => void;
    private onOpen?: () => void;
    private retryCount = 0;
    private maxRetries = 5;
    private statusCallback?: (status: WebSocketStatus) => void;

    private serialize(command: Command): string {
        return JSON.stringify(command);
    }

    private deserialize(data: string): any {
        return JSON.parse(data);
    }

    private scheduleReconnect(url: string) {
        if (this.retryCount >= this.maxRetries) return;
        const delay = Math.pow(2, this.retryCount) * 1000;
        setTimeout(() => {
            this.retryCount++;
            this.connect(url);
        }, delay);
    }

    constructor(private schema: z.ZodSchema = BaseMessageSchema) { }

    connect(url: string) {
        if (this.socket) return;
        this.statusCallback?.('connecting');

        this.socket = new WebSocket(url);

        this.socket.onmessage = (event) => {
            const msg = this.deserialize(event.data);
            const parsed = this.schema.safeParse(msg);
            if (!parsed.success) {
                console.error('Invalid message structure:', parsed.error);
                return;
            }
            const { type, payload } = parsed.data;
            this.emitter.emit(type, payload);
        };

        this.socket.onerror = (err) => {
            console.error('WebSocket error:', err);
            this.statusCallback?.('error');
        };

        this.socket.onopen = () => {
            this.retryCount = 0;
            this.statusCallback?.('open');
            this.onOpen?.();
            this.emitter.emit('open', null);
        };

        this.socket.onclose = () => {
            this.socket = null;
            this.onClose?.();
            this.scheduleReconnect(url);
            this.emitter.emit('close', null);
        };
    }

    disconnect() {
        this.statusCallback?.('closed');
        this.socket?.close();
        this.socket = null;
        this.emitter.clear();
    }

    setOnOpen(callback: () => void) {
        this.onOpen = callback;
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.onOpen();
        }
    }

    setOnClose(callback: () => void) {
        this.onClose = callback;
    }

    setStatusCallback(callback: (status: WebSocketStatus) => void) {
        this.statusCallback = callback;
    }

    send(command: Command) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(this.serialize(command));
    }

    onMessage<T = any>(type: string, callback: (payload: T) => void): () => void {
        return this.emitter.on(type, callback);
    }
}

export const wsManager = new WebSocketManager();

export function useWebSocket(
    url: string,
    messageHandlers: { [type: string]: (payload: any) => void }
) {
    const [status, setStatus] = useState<WebSocketStatus>('connecting');
    const managerRef = useRef<WebSocketManager | null>(null);
    const handlerKeys = useMemo(() => Object.keys(messageHandlers).join('|'), [messageHandlers]);

    useEffect(() => {
        const manager = new WebSocketManager();
        manager.setStatusCallback(setStatus);
        manager.connect(url);
        const unsubscribers = Object.entries(messageHandlers).map(
            ([type, handler]) => manager.onMessage(type, handler)
        );
        managerRef.current = manager;

        return () => {
            unsubscribers.forEach(unsub => unsub());
            manager.disconnect();
        };
    }, [url, handlerKeys]);

    return {
        send: (cmd: Command) => managerRef.current?.send(cmd),
        status,
    };
}
