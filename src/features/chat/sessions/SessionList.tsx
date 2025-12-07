/** Session list component for displaying chat sessions */

import React from "react";
import { ChatThreadList } from "../../../components/chat/ChatThreadList";
import type { ChatThread } from "../../../types/chat.types";

import { SessionFilters } from "../../../components/chat/SessionSearch";

interface SessionListProps {
  onSelectSession: (thread: ChatThread) => void;
  selectedSessionId?: string;
  searchQuery?: string;
  filters?: SessionFilters;
}

export function SessionList({ 
  onSelectSession, 
  selectedSessionId,
  searchQuery,
  filters,
}: SessionListProps) {
  return (
    <ChatThreadList
      onSelectThread={onSelectSession}
      selectedThreadId={selectedSessionId}
      searchQuery={searchQuery}
      filters={filters}
    />
  );
}

