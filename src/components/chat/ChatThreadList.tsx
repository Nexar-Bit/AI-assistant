import { useEffect, useState } from "react";
import { fetchChatThreads } from "../../api/chat";
import { useWorkshopStore } from "../../stores/workshop.store";
import type { ChatThread } from "../../types/chat.types";
import { formatDateTime } from "../../utils/formatters";
import type { SessionFilters } from "./SessionSearch";

interface ChatThreadListProps {
  onSelectThread: (thread: ChatThread) => void;
  selectedThreadId?: string;
  searchQuery?: string;
  filters?: SessionFilters;
}

export function ChatThreadList({
  onSelectThread,
  selectedThreadId,
  searchQuery,
  filters,
}: ChatThreadListProps) {
  const { currentWorkshop } = useWorkshopStore();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkshop) {
      loadThreads();
      // Refresh threads every 30 seconds
      const interval = setInterval(loadThreads, 30000);
      return () => clearInterval(interval);
    }
  }, [currentWorkshop, searchQuery, filters]);

  const loadThreads = async () => {
    if (!currentWorkshop) return;
    
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        workshop_id: currentWorkshop.id,
        is_archived: false,
      };

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters?.is_resolved !== null && filters?.is_resolved !== undefined) {
        params.is_resolved = filters.is_resolved;
      }
      if (filters?.license_plate) {
        params.license_plate = filters.license_plate;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await fetchChatThreads(params);
      setThreads(response.threads);
    } catch (err: any) {
      console.error("Failed to load threads:", err);
      setError(err.response?.data?.detail || "Failed to load threads");
    } finally {
      setLoading(false);
    }
  };

  if (loading && threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-sm text-slate-400">Loading threads...</div>
      </div>
    );
  }

  if (error && threads.length === 0) {
    return (
      <div className="text-sm text-red-400 p-4">{error}</div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-sm text-slate-400 p-4 text-center">
        No chat threads yet. Start a new conversation!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelectThread(thread)}
          className={`w-full text-left touch-target rounded-lg transition-all swipeable-item ${
            selectedThreadId === thread.id
              ? "bg-primary-700/30 border border-primary-500/50"
              : "glass hover:bg-slate-800/50 border border-slate-700/50"
          }`}
        >
          <div className="font-medium text-sm text-slate-200 mb-1">
            {thread.title || thread.license_plate}
          </div>
          <div className="text-xs text-slate-400">
            {thread.license_plate} • {formatDateTime(thread.created_at)}
          </div>
          {thread.is_resolved && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent-600/20 text-accent-300 rounded">
              Resolved
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

