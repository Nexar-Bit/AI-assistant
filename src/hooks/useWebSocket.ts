import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../stores/auth.store";

interface WebSocketMessage {
  type: "message" | "typing" | "error" | "status";
  [key: string]: any;
}

interface UseWebSocketOptions {
  threadId: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  threadId,
  onMessage,
  onError,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!threadId) return;

    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      setConnectionError("Not authenticated");
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Build WebSocket URL
    const getWebSocketUrl = (): string => {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        // Production: use the API URL from environment
        const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
        const wsHost = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        return `${wsProtocol}://${wsHost}/api/v1/ws/chat/${threadId}?token=${accessToken}`;
      }
      // Development: use proxy
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      return `${protocol}//${host}/api/v1/ws/chat/${threadId}?token=${accessToken}`;
    };

    const wsUrl = getWebSocketUrl();

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("WebSocket connection error");
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setConnectionError("Failed to create WebSocket connection");
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const sendMessage = (content: string, attachments: any[] = []) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        content,
        attachments,
      })
    );
  };

  useEffect(() => {
    if (threadId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [threadId]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect,
  };
}

