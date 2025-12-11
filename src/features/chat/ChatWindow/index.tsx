/** Chat window component - main chat interface */

import React from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { EmptyChatState } from "../../../components/chat/EmptyChatState";
import { useChat } from "../context/useChat";
import { useWorkshopStore } from "../../../stores/workshop.store";
import { usePermissions } from "../../../hooks/usePermissions";
import { downloadChatThreadPDFFile } from "../../../api/reports";
import { useNotification } from "../../../components/layout/NotificationProvider";
import type { ChatThread } from "../../../types/chat.types";

interface ChatWindowProps {
  thread: ChatThread | null;
  onCreateSession?: () => void;
}

export function ChatWindow({ thread, onCreateSession }: ChatWindowProps) {
  const { currentWorkshop } = useWorkshopStore();
  const { canAccess } = usePermissions();
  const { showSuccess, showCritical } = useNotification();
  const {
    messages,
    isLoading,
    typingUsers,
    error,
    clearError,
    sendMessage,
    updateThreadStatus,
    deleteThread,
    errorCodes,
    setErrorCodes,
    estimatedTokens,
    remainingTokens,
    tokenUsage,
  } = useChat();

  const handleDownloadPDF = async () => {
    if (!thread) return;
    try {
      await downloadChatThreadPDFFile(thread.id, thread.license_plate);
      showSuccess("PDF descargado exitosamente", "Descarga completa");
    } catch (error: any) {
      console.error("Failed to download PDF:", error);
      // Extract detailed error message
      const errorMessage = error.message || error.response?.data?.detail || "No se pudo descargar el PDF. Por favor revisa los logs del servidor para más detalles.";
      showCritical(errorMessage, "Error de descarga");
    }
  };

  if (!thread) {
    return <EmptyChatState onCreateSession={onCreateSession} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <ChatHeader
        licensePlate={thread.license_plate}
        make={thread.vehicle_context?.match(/Make: (.+)/)?.[1]}
        model={thread.vehicle_context?.match(/Model: (.+)/)?.[1]}
        year={thread.vehicle_context?.match(/Year: (.+)/)?.[1] ? parseInt(thread.vehicle_context.match(/Year: (.+)/)?.[1] || "0") : undefined}
        currentKm={thread.vehicle_km || undefined}
        engineType={thread.vehicle_context?.match(/Engine Type: (.+)/)?.[1]}
        errorCodes={thread.error_codes || undefined}
        status={thread.status === "completed" ? "resolved" : (thread.status as "active" | "resolved" | "archived")}
        threadId={thread.id}
        createdAt={thread.created_at}
        tokenUsage={canAccess.viewTokenUsage ? tokenUsage : null}
        onStatusChange={updateThreadStatus}
        onDelete={deleteThread}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        typingUsers={typingUsers}
      />

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        estimatedTokens={canAccess.viewTokenUsage ? estimatedTokens : undefined}
        remainingTokens={canAccess.viewTokenUsage ? remainingTokens : undefined}
        tokenLimit={canAccess.viewTokenUsage ? (currentWorkshop?.monthly_token_limit || 10000) : undefined}
        errorCodes={errorCodes}
        onErrorCodesChange={setErrorCodes}
        vehicleData={{
          license_plate: thread.license_plate,
          make: thread.vehicle_context?.match(/Make: (.+)/)?.[1],
          model: thread.vehicle_context?.match(/Model: (.+)/)?.[1],
          year: thread.vehicle_context?.match(/Year: (.+)/)?.[1]
            ? parseInt(thread.vehicle_context.match(/Year: (.+)/)?.[1] || "0")
            : undefined,
          current_km: thread.vehicle_km || undefined,
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="px-6 py-3 bg-error-500/10 border-t border-error-500/30 flex items-center justify-between gap-4">
          <p className="text-sm text-error-400 flex-1">{error}</p>
          <button
            onClick={clearError}
            className="text-error-400 hover:text-error-300 transition-colors flex-shrink-0"
            aria-label="Descartar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

