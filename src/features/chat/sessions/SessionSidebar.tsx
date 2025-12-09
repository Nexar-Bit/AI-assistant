/** Session sidebar component with session list and new session button */

import React, { useState } from "react";
import { SessionList } from "./SessionList";
import { SessionSearch, SessionFilters } from "../../../components/chat/SessionSearch";
import { Button } from "../../../components/common/Button";
import { MessageSquareIcon } from "../../../components/icons/AutomotiveIcons";
import type { ChatThread } from "../../../types/chat.types";

interface SessionSidebarProps {
  onSelectSession: (thread: ChatThread) => void;
  onCreateSession: () => void;
  selectedSessionId?: string;
}

export function SessionSidebar({
  onSelectSession,
  onCreateSession,
  selectedSessionId,
}: SessionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SessionFilters>({});

  return (
    <div className="w-80 glass-strong border-r border-industrial-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-industrial-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-industrial-300 uppercase tracking-wider">
            Sesiones de chat
          </h2>
          <Button
            variant="primary"
            className="text-xs px-3 py-1.5"
            onClick={onCreateSession}
          >
            <MessageSquareIcon size={14} className="mr-1" />
            Nuevo
          </Button>
        </div>
        {/* Search */}
        <SessionSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilters}
          filters={filters}
        />
      </div>

      {/* Session List - Swipeable on mobile */}
      <div className="flex-1 overflow-y-auto p-2 swipeable-list smooth-scroll">
        <SessionList
          onSelectSession={onSelectSession}
          selectedSessionId={selectedSessionId}
          searchQuery={searchQuery}
          filters={filters}
        />
      </div>
    </div>
  );
}

