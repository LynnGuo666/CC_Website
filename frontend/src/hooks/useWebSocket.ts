'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// --- WebSocket Hook ---

const getWebSocketURL = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_URL?.replace(/^wss?:\/\//, '') || window.location.host;
    return `${protocol}//${host}`;
  }
  return process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';
};

type WebSocketOptions<T> = {
  onMessage: (data: T) => void;
  onError?: (event: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
};

/**
 * A custom hook to manage a WebSocket connection with auto-reconnect.
 * @param path The WebSocket path to connect to (e.g., '/ws/live/1') or null to disable.
 * @param options Event handlers and reconnection settings for the WebSocket connection.
 */
export function useWebSocket<T>(path: string | null, options: WebSocketOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectInterval = options.reconnectInterval || 3000;
  const maxReconnectAttempts = options.maxReconnectAttempts || 10;

  const connect = useCallback(() => {
    if (!path) return;

    const url = `${getWebSocketURL()}${path}`;
    console.log(`Connecting to WebSocket: ${url}`);
    
    try {
      ws.current = new WebSocket(url);

      const handleOpen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempt(0);
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

      const handleClose = (event: CloseEvent) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Auto-reconnect logic
        if (reconnectAttempt < maxReconnectAttempts && !event.wasClean) {
          const nextAttempt = reconnectAttempt + 1;
          setReconnectAttempt(nextAttempt);
          
          console.log(`Attempting to reconnect in ${reconnectInterval}ms (attempt ${nextAttempt}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
        
        options.onClose?.();
      };

      ws.current.addEventListener('open', handleOpen);
      ws.current.addEventListener('message', handleMessage);
      ws.current.addEventListener('error', handleError);
      ws.current.addEventListener('close', handleClose);

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      options.onError?.(new Event('connection-failed'));
    }
  }, [path, options, reconnectAttempt, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      ws.current.close(1000, 'Component unmounting');
    }
    
    setIsConnected(false);
    setReconnectAttempt(0);
  }, []);

  useEffect(() => {
    if (path) {
      connect();
    }

    // Cleanup on component unmount or path change
    return () => {
      disconnect();
    };
  }, [path, connect, disconnect]);

  return { 
    isConnected, 
    reconnectAttempt, 
    maxReconnectAttempts,
    disconnect,
    connect 
  };
}