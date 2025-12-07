/** Chat context provider for managing chat state */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { getChatThread, sendMessage as sendMessageApi, createChatThread, updateChatThread, deleteChatThread } from "../../../api/chat";
import { useWorkshopStore } from "../../../stores/workshop.store";
import { useAuthStore } from "../../../stores/auth.store";
import { useNotification } from "../../../components/layout/NotificationProvider";
import type { ChatThread, ChatMessage } from "../../../types/chat.types";

interface ChatContextValue {
  // Current thread
  currentThread: ChatThread | null;
  setCurrentThread: (thread: ChatThread | null) => void;
  
  // Messages
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  
  // WebSocket
  isConnected: boolean;
  typingUsers: Set<string>;
  
  // Actions
  sendMessage: (content: string, attachments?: any) => Promise<void>;
  createSession: (data: {
    license_plate: string;
    vehicle_id?: string;
    vehicle_km?: number;
    error_codes?: string;
    vehicle_context?: string;
  }) => Promise<ChatThread>;
  updateThreadStatus: (status: "active" | "completed" | "archived", isResolved?: boolean) => Promise<void>;
  deleteThread: () => Promise<void>;
  
  // Error codes
  errorCodes: string[];
  setErrorCodes: (codes: string[]) => void;
  
  // Token info
  estimatedTokens: number;
  remainingTokens?: number;
  tokenUsage: {
    user?: {
      daily_limit?: number | null;
      daily_used?: number;
      daily_remaining?: number | null;
      monthly_limit?: number | null;
      monthly_used?: number;
      monthly_remaining?: number | null;
      is_unlimited?: boolean;
    };
    workshop?: {
      monthly_limit?: number;
      monthly_used?: number;
      monthly_remaining?: number;
    };
  } | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { currentWorkshop } = useWorkshopStore();
  const { accessToken } = useAuthStore();
  const { showSuccess, showCritical } = useNotification();
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [errorCodes, setErrorCodes] = useState<string[]>([]);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [tokenUsage, setTokenUsage] = useState<{
    user?: {
      daily_limit?: number | null;
      daily_used?: number;
      daily_remaining?: number | null;
      monthly_limit?: number | null;
      monthly_used?: number;
      monthly_remaining?: number | null;
      is_unlimited?: boolean;
    };
    workshop?: {
      monthly_limit?: number;
      monthly_used?: number;
      monthly_remaining?: number;
    };
  } | null>(null);

  // WebSocket connection
  const { isConnected, sendMessage: wsSendMessage } = useWebSocket({
    threadId: currentThread?.id || null,
    onMessage: (message) => {
      if (message.type === "message") {
        if (message.user_message && message.assistant_message) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages: ChatMessage[] = [];
            
            if (!existingIds.has(message.user_message.id)) {
              newMessages.push(message.user_message as ChatMessage);
            }
            if (!existingIds.has(message.assistant_message.id)) {
              newMessages.push(message.assistant_message as ChatMessage);
            }
            
            return newMessages.length > 0 ? [...prev, ...newMessages] : prev;
          });
          
          if (message.thread && currentThread) {
            setCurrentThread({
              ...currentThread,
              total_tokens: message.thread.total_tokens,
              last_message_at: message.thread.last_message_at,
            });
          }
          
          // Update token usage if provided
          if (message.token_usage) {
            setTokenUsage(message.token_usage);
          }
        }
      } else if (message.type === "typing") {
        setTypingUsers((prev) => new Set(prev).add(message.user_id));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(message.user_id);
            return next;
          });
        }, 3000);
      } else if (message.type === "error") {
        const errorMsg = message.message || "An error occurred";
        setError(errorMsg);
        // Log error details for debugging
        console.error("WebSocket error:", {
          message: errorMsg,
          error_type: message.error_type,
          full_message: message,
        });
      }
    },
    onError: () => {
      setError("Connection error. Attempting to reconnect...");
    },
    onConnect: () => {
      setError(null);
    },
  });

  // Load messages when thread changes
  useEffect(() => {
    if (currentThread) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentThread?.id]);

  const loadMessages = async () => {
    if (!currentThread) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getChatThread(currentThread.id);
      setMessages(response.messages);
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      setError(err.response?.data?.detail || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string, attachments?: any) => {
    if (!currentThread) return;
    
    // Clear any previous errors when sending a new message
    setError(null);
    
    // Estimate tokens (rough: 4 chars per token)
    const estimated = Math.ceil(content.length / 4) + 800;
    setEstimatedTokens(estimated);
    
    try {
      if (isConnected) {
        wsSendMessage(content, attachments || []);
      } else {
        // Fallback to REST API
        const response = await sendMessageApi(currentThread.id, {
          content,
          attachments: attachments || {},
        });
        
        setMessages((prev) => [
          ...prev,
          response.user_message,
          response.assistant_message,
        ]);
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to send message";
      setError(errorMessage);
    }
  }, [currentThread, isConnected, wsSendMessage]);

  const createSession = useCallback(async (data: {
    license_plate: string;
    vehicle_id?: string;
    vehicle_km?: number;
    error_codes?: string;
    vehicle_context?: string;
  }) => {
    if (!currentWorkshop) {
      throw new Error("No workshop selected");
    }
    
    const thread = await createChatThread({
      workshop_id: currentWorkshop.id,
      license_plate: data.license_plate,
      vehicle_id: data.vehicle_id,
      vehicle_km: data.vehicle_km,
      error_codes: data.error_codes,
      vehicle_context: data.vehicle_context,
    });
    
    setCurrentThread(thread);
    return thread;
  }, [currentWorkshop]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateThreadStatus = useCallback(async (
    status: "active" | "completed" | "archived",
    isResolved?: boolean
  ) => {
    if (!currentThread) return;

    try {
      const updated = await updateChatThread(currentThread.id, {
        status,
        is_resolved: isResolved !== undefined ? isResolved : (status === "completed"),
      });
      
      // Update current thread with new status
      setCurrentThread(updated);
      showSuccess(
        `Chat status updated to ${status === "active" ? "In Progress" : status === "completed" ? "Completed" : "Archived"}`,
        "Status Updated"
      );
    } catch (err: any) {
      console.error("Failed to update thread status:", err);
      showCritical(
        err.response?.data?.detail || "Failed to update chat status",
        "Error"
      );
    }
  }, [currentThread, showSuccess, showCritical]);

  const deleteThread = useCallback(async () => {
    if (!currentThread) return;

    if (!confirm(`Are you sure you want to delete this chat history for ${currentThread.license_plate}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteChatThread(currentThread.id);
      setCurrentThread(null);
      setMessages([]);
      showSuccess("Chat history deleted successfully", "Deleted");
    } catch (err: any) {
      console.error("Failed to delete thread:", err);
      showCritical(
        err.response?.data?.detail || "Failed to delete chat history",
        "Error"
      );
    }
  }, [currentThread, showSuccess, showCritical]);

  const value: ChatContextValue = {
    currentThread,
    setCurrentThread,
    messages,
    isLoading,
    error,
    clearError,
    isConnected,
    typingUsers,
    sendMessage,
    createSession,
    updateThreadStatus,
    deleteThread,
    errorCodes,
    setErrorCodes,
    estimatedTokens,
    remainingTokens: tokenUsage?.user?.daily_remaining ?? undefined,
    tokenUsage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}

