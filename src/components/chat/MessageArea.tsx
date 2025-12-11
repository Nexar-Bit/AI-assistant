/** Message area with technician, AI, and system messages */

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { MessageSquareIcon } from "../icons/AutomotiveIcons";
import type { ChatMessage } from "../../types/chat.types";

interface MessageAreaProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  typingUsers?: Set<string>;
}

export function MessageArea({
  messages,
  isLoading = false,
  typingUsers = new Set(),
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-industrial-800 rounded-full flex items-center justify-center mx-auto">
            <MessageSquareIcon size={32} className="text-industrial-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-industrial-300 mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-industrial-500">
              Ask about vehicle diagnostics, error codes, or repair procedures
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-8 space-y-6 bg-industrial-950"
      style={{ 
        maxWidth: '100%',
        fontSize: '15px',
        lineHeight: '1.6'
      }}
    >
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="flex items-start gap-3 animate-slide-up">
          <div className="w-8 h-8 bg-gradient-to-br from-industrial-700 to-industrial-800 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse" />
          </div>
          <div className="flex-1 msg-ai-dark">
            <div className="typing-indicator-dark">
              <div className="typing-dot-dark" />
              <div className="typing-dot-dark" />
              <div className="typing-dot-dark" />
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-start gap-3 animate-slide-up">
          <div className="w-8 h-8 bg-gradient-to-br from-industrial-700 to-industrial-800 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse" />
          </div>
          <div className="flex-1 glass rounded-lg p-4 border border-industrial-700/50">
            <div className="flex items-center gap-2 text-sm text-industrial-400">
              <span className="animate-pulse">●</span>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

