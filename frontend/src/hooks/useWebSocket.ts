import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

interface UseWebSocketOptions<T> {
  url?: string;
  onMessage?: (message: WebSocketMessage<T>) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

interface UseWebSocketReturn<T> {
  status: WebSocketStatus;
  lastMessage: WebSocketMessage<T> | null;
  sendMessage: (type: string, payload: unknown) => void;
  connect: () => void;
  disconnect: () => void;
  error: Event | null;
}

export function useWebSocket<T = unknown>(options: UseWebSocketOptions<T> = {}): UseWebSocketReturn<T> {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    enabled = true,
  } = options;

  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage<T> | null>(null);
  const [error, setError] = useState<Event | null>(null);

  const getWebSocketUrl = useCallback(() => {
    if (url) return url;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || window.location.host;
    const wsPath = import.meta.env.VITE_WS_PATH || '/ws';
    
    return `${protocol}//${host}${wsPath}?token=${token}`;
  }, [url, token]);

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = getWebSocketUrl();
      setStatus('connecting');
      setError(null);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage<T> = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        onClose?.();

        if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * reconnectAttemptsRef.current);
        }
      };

      ws.onerror = (err) => {
        setStatus('error');
        setError(err);
        onError?.(err);
      };
    } catch (err) {
      setStatus('error');
      setError(err as Event);
    }
  }, [enabled, getWebSocketUrl, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, connect, disconnect]);

  useEffect(() => {
    if (token) {
      connect();
    }
  }, [token]);

  return {
    status,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    error,
  };
}

export function useDashboardWebSocket() {
  const queryClient = useQueryClient();

  return useWebSocket<{
    type: 'stats_update' | 'activity' | 'alert' | 'system_health';
    data: Record<string, unknown>;
  }>({
    onMessage: (message) => {
      switch (message.payload.type) {
        case 'stats_update':
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
          break;
        case 'activity':
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity'] });
          break;
        case 'alert':
          queryClient.invalidateQueries({ queryKey: ['audit'] });
          break;
        case 'system_health':
          queryClient.invalidateQueries({ queryKey: ['blockchain', 'status'] });
          break;
      }
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';