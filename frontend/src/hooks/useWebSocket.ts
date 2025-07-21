'use client';

import { useState, useEffect, useRef } from 'react';

// --- WebSocket Hook ---

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';

type WebSocketOptions<T> = {
  onMessage: (data: T) => void;
  onError?: (event: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * A custom hook to manage a WebSocket connection.
 * @param path The WebSocket path to connect to (e.g., '/ws/live/1').
 * @param options Event handlers for the WebSocket connection.
 */
export function useWebSocket<T>(path: string | null, options: WebSocketOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!path) {
      return;
    }

    const url = `${WS_BASE_URL}${path}`;
    ws.current = new WebSocket(url);

    const handleOpen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      options.onOpen?.();
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        options.onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    const handleError = (event: Event) => {
      console.error('WebSocket error:', event);
      options.onError?.(event);
    };

    const handleClose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      options.onClose?.();
    };

    ws.current.addEventListener('open', handleOpen);
    ws.current.addEventListener('message', handleMessage);
    ws.current.addEventListener('error', handleError);
    ws.current.addEventListener('close', handleClose);

    // Cleanup on component unmount
    return () => {
      if (ws.current) {
        ws.current.removeEventListener('open', handleOpen);
        ws.current.removeEventListener('message', handleMessage);
        ws.current.removeEventListener('error', handleError);
        ws.current.removeEventListener('close', handleClose);
        ws.current.close();
      }
    };
  }, [path, options]);

  return { isConnected };
}