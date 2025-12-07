import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchChatThreads, updateChatThread } from "../../api/chat";
import { useWorkshopStore } from "../../stores/workshop.store";
import { useNotification } from "../../components/layout/NotificationProvider";
import { formatDateTime } from "../../utils/formatters";
import type { ChatThread } from "../../types/chat.types";

export function HistoryPage() {
  const { currentWorkshop } = useWorkshopStore();
  const { showCritical } = useNotification();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    license_plate: "",
    status: "all" as "all" | "active" | "completed" | "archived",
    is_resolved: null as boolean | null,
    search: "",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentWorkshop) {
      loadThreads();
    } else {
      setLoading(false);
    }
  }, [currentWorkshop, filters]);

  const loadThreads = async () => {
    if (!currentWorkshop) return;

    setLoading(true);
    setError(null);
    try {
      const params: any = {
        workshop_id: currentWorkshop.id,
      };

      if (filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters.is_resolved !== null) {
        params.is_resolved = filters.is_resolved;
      }
      if (filters.license_plate) {
        params.license_plate = filters.license_plate;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await fetchChatThreads(params);
      setThreads(response.threads);
    } catch (err: any) {
      console.error("Failed to load threads:", err);
      setError(err.response?.data?.detail || "Failed to load history");
      showCritical(err.response?.data?.detail || "Failed to load history", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (threads.length === 0) return;
    const headers = ["id", "created_at", "license_plate", "total_tokens", "status", "is_resolved"];
    const rows = threads.map((t) => [
      t.id,
      t.created_at,
      t.license_plate,
      String(t.total_tokens),
      t.status,
      String(t.is_resolved),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-threads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkResolve = async () => {
    if (selected.size === 0) return;
    
    try {
      const ids = Array.from(selected);
      await Promise.all(
        ids.map((id) =>
          updateChatThread(id, { is_resolved: true })
        )
      );
      setSelected(new Set());
      loadThreads(); // Reload to reflect changes
    } catch (err: any) {
      console.error("Failed to mark threads as resolved:", err);
      showCritical(err.response?.data?.detail || "Failed to update threads", "Error");
    }
  };

  const toggleAll = () => {
    if (selected.size === threads.length && threads.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(threads.map((t) => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!currentWorkshop) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <div className="card text-center py-12">
          <p className="text-industrial-400">Please select a workshop to view history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <h1 className="text-3xl font-bold text-industrial-100 mb-2">
          Consultation History
        </h1>
        <p className="text-industrial-400">
          View and manage all your vehicle diagnostic consultations
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-industrial-300">License Plate</label>
            <input
              className="input-industrial"
              value={filters.license_plate}
              onChange={(e) =>
                setFilters({ ...filters, license_plate: e.target.value })
              }
              placeholder="ABC-123"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-industrial-300">Status</label>
            <select
              className="input-industrial"
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as any,
                })
              }
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-industrial-300">Resolved</label>
            <select
              className="input-industrial"
              value={
                filters.is_resolved === null
                  ? "all"
                  : filters.is_resolved
                  ? "resolved"
                  : "pending"
              }
              onChange={(e) => {
                const val = e.target.value;
                setFilters({
                  ...filters,
                  is_resolved:
                    val === "all"
                      ? null
                      : val === "resolved"
                      ? true
                      : false,
                });
              }}
            >
              <option value="all">All</option>
              <option value="resolved">Resolved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-industrial-300">Search</label>
            <input
              className="input-industrial"
              placeholder="Search threads..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleExportCsv}
              disabled={threads.length === 0}
              className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
            <button
              onClick={handleBulkResolve}
              disabled={selected.size === 0}
              className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Resolved ({selected.size})
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 animate-slide-up">
          {error}
        </div>
      )}

      {loading && threads.length === 0 ? (
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-industrial-400">Loading history...</p>
          </div>
        </div>
      ) : threads.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-industrial-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-industrial-400 font-medium">No threads match the current filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-industrial-800/50 border-b border-industrial-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  <input
                    type="checkbox"
                    checked={selected.size === threads.length && threads.length > 0}
                    onChange={toggleAll}
                    className="rounded border-industrial-600 bg-industrial-800 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  License Plate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Tokens
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/50">
              {threads.map((thread) => (
                <tr key={thread.id} className="hover:bg-industrial-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(thread.id)}
                      onChange={() => toggleOne(thread.id)}
                      className="rounded border-industrial-600 bg-industrial-800 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {formatDateTime(thread.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-industrial-100">
                    {thread.license_plate}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {thread.title || "Untitled"}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-industrial-800/50">
                      {thread.total_tokens.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        thread.is_resolved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${thread.is_resolved ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                      {thread.is_resolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/chat?thread=${thread.id}`}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


