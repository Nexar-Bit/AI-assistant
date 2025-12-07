/** Compact vehicle info bar with icons, status, and real-time duration */

import React, { useState, useEffect } from "react";
import { CarIcon, AlertIcon, CheckCircleIcon, ClockIcon } from "../icons/AutomotiveIcons";

interface ChatHeaderProps {
  licensePlate: string;
  make?: string;
  model?: string;
  year?: number;
  currentKm?: number;
  engineType?: string;
  errorCodes?: string;
  status?: "active" | "resolved" | "archived";
  threadId?: string;
  createdAt?: string;
  tokenUsage?: {
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
  onAttach?: () => void;
  onTemplate?: () => void;
  onHistory?: () => void;
  onStatusChange?: (status: "active" | "completed" | "archived", isResolved?: boolean) => void;
  onDelete?: () => void;
  onDownloadPDF?: () => void;
}

export function ChatHeader({
  licensePlate,
  make,
  model,
  year,
  currentKm,
  engineType,
  errorCodes,
  status = "active",
  threadId,
  createdAt,
  tokenUsage,
  onAttach,
  onTemplate,
  onHistory,
  onStatusChange,
  onDelete,
  onDownloadPDF,
}: ChatHeaderProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("0m");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Calculate real-time elapsed duration
  useEffect(() => {
    if (!createdAt) return;

    const updateElapsed = () => {
      const start = new Date(createdAt).getTime();
      const now = Date.now();
      const diff = now - start;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        setElapsedTime(`${hours}h ${minutes % 60}m`);
      } else {
        setElapsedTime(`${minutes}m`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt]);

  // Status color coding
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "text-warning-400";
      case "resolved":
      case "completed":
        return "text-success-400";
      case "archived":
        return "text-industrial-400";
      default:
        return "text-industrial-400";
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "active":
        return "bg-warning-500/10 border-warning-500/30";
      case "resolved":
      case "completed":
        return "bg-success-500/10 border-success-500/30";
      case "archived":
        return "bg-industrial-500/10 border-industrial-500/30";
      default:
        return "bg-industrial-500/10 border-industrial-500/30";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "IN PROGRESS";
      case "resolved":
      case "completed":
        return "RESOLVED";
      case "archived":
        return "ARCHIVED";
      default:
        return "ACTIVE";
    }
  };

  return (
    <div className="glass-strong border-b border-industrial-800">
      {/* Compact Vehicle Info Bar */}
      <div className="px-4 py-2.5 font-mono text-xs">
        {/* First Row: Vehicle, Plate, KM */}
        <div className="flex items-center gap-3 text-sm font-medium text-industrial-200 flex-wrap">
          {/* Vehicle */}
          <div className="flex items-center gap-1.5">
            <CarIcon size={14} className="text-primary-400 flex-shrink-0" />
            <span className="text-industrial-100 whitespace-nowrap">
              <span className="text-industrial-400">VEHICLE:</span>{" "}
              {make && model ? `${make} ${model}` : "Unknown"}
              {year && ` ${year}`}
            </span>
          </div>
          
          <span className="text-industrial-600">|</span>
          
          {/* License Plate */}
          <div className="flex items-center gap-1.5">
            <span className="text-primary-400 text-base">🏷️</span>
            <span className="font-mono text-industrial-100 whitespace-nowrap">
              <span className="text-industrial-400">PLATE:</span> {licensePlate}
            </span>
          </div>
          
          {currentKm && (
            <>
              <span className="text-industrial-600">|</span>
              {/* KM */}
              <div className="flex items-center gap-1.5">
                <span className="text-primary-400 text-base">📏</span>
                <span className="text-industrial-100 whitespace-nowrap">
                  <span className="text-industrial-400">KM:</span> {currentKm.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Second Row: Engine, Status, Duration */}
        <div className="flex items-center gap-3 text-sm font-medium text-industrial-200 mt-1.5 flex-wrap">
          {/* Engine */}
          {engineType && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-primary-400 text-base">⚙️</span>
                <span className="text-industrial-100 whitespace-nowrap">
                  <span className="text-industrial-400">ENGINE:</span> {engineType}
                </span>
              </div>
              <span className="text-industrial-600">|</span>
            </>
          )}
          
          {/* Status - Clickable to change */}
          <div className="flex items-center gap-1.5 relative">
            <span className="text-primary-400 text-base">🚦</span>
            {onStatusChange && threadId ? (
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`px-2 py-0.5 rounded border text-xs font-semibold whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${getStatusBg()} ${getStatusColor()} flex items-center gap-1`}
                  title="Click to change status"
                >
                  STATUS: {getStatusText()}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showStatusMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowStatusMenu(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-industrial-800 border border-industrial-700 rounded-lg shadow-lg z-20 min-w-[180px]">
                      <button
                        onClick={() => {
                          onStatusChange("active", false);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-industrial-700 transition-colors first:rounded-t-lg ${
                          status === "active" ? "bg-primary-500/20 text-primary-300" : "text-industrial-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-warning-400"></span>
                          In Progress
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          onStatusChange("completed", true);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-industrial-700 transition-colors ${
                          status === "resolved" || status === "completed" ? "bg-success-500/20 text-success-300" : "text-industrial-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-success-400"></span>
                          Complete / Resolved
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          onStatusChange("archived", false);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-industrial-700 transition-colors last:rounded-b-lg ${
                          status === "archived" ? "bg-industrial-500/20 text-industrial-300" : "text-industrial-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-industrial-400"></span>
                          Archived
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <span className={`px-2 py-0.5 rounded border text-xs font-semibold whitespace-nowrap ${getStatusBg()} ${getStatusColor()}`}>
                STATUS: {getStatusText()}
              </span>
            )}
          </div>
          
          {/* Duration */}
          {createdAt && (
            <>
              <span className="text-industrial-600">|</span>
              <div className="flex items-center gap-1.5">
                <ClockIcon size={14} className="text-primary-400 flex-shrink-0" />
                <span className="text-industrial-100 whitespace-nowrap">
                  <span className="text-industrial-400">⏱️</span> {elapsedTime} elapsed
                </span>
              </div>
            </>
          )}
          
          {/* Download PDF Button */}
          {onDownloadPDF && threadId && (
            <>
              <span className="text-industrial-600">|</span>
              <button
                onClick={onDownloadPDF}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                title="Download PDF report"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
            </>
          )}
          
          {/* Delete Button */}
          {onDelete && threadId && (
            <>
              <span className="text-industrial-600">|</span>
              <button
                onClick={onDelete}
                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                title="Delete this chat"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Codes Bar (if present) */}
      {errorCodes && (
        <div className="px-4 py-2 bg-warning-500/10 border-t border-warning-500/30">
          <div className="flex items-center gap-2 text-sm">
            <AlertIcon size={16} className="text-warning-400" />
            <span className="text-warning-400 font-medium">DTC Codes:</span>
            <div className="flex flex-wrap gap-2">
              {errorCodes.split(",").map((code, idx) => (
                <span key={idx} className="font-mono text-warning-300 bg-warning-500/20 px-2 py-0.5 rounded">
                  {code.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

