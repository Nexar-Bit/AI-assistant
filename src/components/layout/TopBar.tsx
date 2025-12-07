/** Top bar with Logo, Workshop Switcher, User Menu, and Help */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { useWorkshopStore } from "../../stores/workshop.store";
import { fetchWorkshops } from "../../api/workshops";
import type { Workshop } from "../../types/workshop.types";
// Modern icon components (inline SVGs - latest design)
const BuildingIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12h12" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

const ChevronDownIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const HelpCircleIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const LogOutIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SettingsIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SparklesIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export function TopBar() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { currentWorkshop, workshops, setCurrentWorkshop, setWorkshops } = useWorkshopStore();
  const [showWorkshopMenu, setShowWorkshopMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const workshopMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWorkshops();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workshopMenuRef.current && !workshopMenuRef.current.contains(event.target as Node)) {
        setShowWorkshopMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadWorkshops = async () => {
    try {
      const response = await fetchWorkshops();
      setWorkshops(response.workshops);
      if (!currentWorkshop && response.workshops.length > 0) {
        setCurrentWorkshop(response.workshops[0]);
      }
    } catch (err) {
      console.error("Failed to load workshops:", err);
    }
  };

  const handleWorkshopSelect = (workshop: Workshop) => {
    setCurrentWorkshop(workshop);
    setShowWorkshopMenu(false);
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xl backdrop-blur-sm">
      {/* Left: Logo - Vibrant Design */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-accent-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/50 ring-2 ring-white/20">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent">
            Vehicle Diagnostics AI
          </h1>
        </div>
      </div>

      {/* Center: Workshop Switcher */}
      <div className="flex-1 flex justify-center">
        <div className="relative" ref={workshopMenuRef}>
          <button
            onClick={() => setShowWorkshopMenu(!showWorkshopMenu)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:from-slate-700 hover:to-slate-600 rounded-xl border border-slate-600/50 transition-all duration-300 min-w-[200px] shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
          >
            <BuildingIcon className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-semibold text-white truncate">
              {currentWorkshop?.name || "Select Workshop"}
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                showWorkshopMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Workshop Dropdown - Modern Design */}
          {showWorkshopMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
              <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                {workshops.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-industrial-400 text-center">
                    No workshops available
                  </div>
                ) : (
                  workshops.map((workshop) => (
                    <button
                      key={workshop.id}
                      onClick={() => handleWorkshopSelect(workshop)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                        currentWorkshop?.id === workshop.id
                          ? "bg-gradient-to-r from-primary-500/30 to-accent-500/30 text-white border border-primary-400/50 shadow-lg"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }`}
                    >
                      <BuildingIcon className="w-5 h-5 text-primary-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{workshop.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {workshop.tokens_used_this_month.toLocaleString()} /{" "}
                          {workshop.monthly_token_limit.toLocaleString()} tokens
                        </p>
                      </div>
                      {currentWorkshop?.id === workshop.id && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: User Menu & Help */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* User Menu - Modern Design */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:from-slate-700 hover:to-slate-600 rounded-xl border border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 via-accent-400 to-primary-600 rounded-full flex items-center justify-center ring-2 ring-white/20 shadow-lg">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            <ChevronDownIcon
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* User Dropdown - Modern Design */}
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
              <div className="p-2 space-y-1">
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <p className="text-sm font-bold text-white">User Account</p>
                  <p className="text-xs text-slate-400">user@example.com</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                  type="button"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span className="font-medium">Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Button - Modern Design */}
        <div className="relative" ref={helpMenuRef}>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2.5 bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:from-slate-700 hover:to-slate-600 rounded-xl border border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 backdrop-blur-sm"
            title="Help"
            aria-label="Help"
          >
            <HelpCircleIcon className="w-5 h-5 text-primary-400" />
          </button>

          {/* Help Dropdown - Modern Design */}
          {showHelp && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white mb-3 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Help & Support
                </h3>
                <div className="space-y-1">
                  <a
                    href="#"
                    className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                  >
                    📖 Documentation
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                  >
                    🎥 Video Tutorials
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                  >
                    💬 Contact Support
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                  >
                    🐛 Report Issue
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
