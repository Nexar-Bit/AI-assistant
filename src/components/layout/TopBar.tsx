/** Top bar with Logo, Workshop Switcher, User Menu, and Help */

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { useWorkshopStore } from "../../stores/workshop.store";
import { fetchWorkshops, createWorkshop } from "../../api/workshops";
import { useNotification } from "../layout/NotificationProvider";
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
  const { logout, user } = useAuthStore();
  const { currentWorkshop, workshops, setCurrentWorkshop, setWorkshops } = useWorkshopStore();
  const { showSuccess, showCritical } = useNotification();
  
  const isPlatformAdmin = user?.role === "admin";
  const [showWorkshopMenu, setShowWorkshopMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    description: "",
    monthly_token_limit: 100000,
  });
  const [creating, setCreating] = useState(false);
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

  const handleCreateWorkshop = async () => {
    if (!createData.name.trim()) {
      showCritical("El nombre del taller es requerido", "Error de validación");
      return;
    }

    setCreating(true);
    try {
      const newWorkshop = await createWorkshop({
        name: createData.name.trim(),
        description: createData.description.trim() || undefined,
        monthly_token_limit: createData.monthly_token_limit,
      });
      
      // Refresh workshops list
      await loadWorkshops();
      
      // Auto-select the newly created workshop
      setCurrentWorkshop(newWorkshop);
      
      setShowCreateModal(false);
      setShowWorkshopMenu(false);
      setCreateData({ name: "", description: "", monthly_token_limit: 100000 });
      showSuccess("Taller creado exitosamente. Ahora eres el propietario.", "Éxito");
    } catch (err: any) {
      console.error("Failed to create workshop:", err);
      showCritical(err.response?.data?.detail || "No se pudo crear el taller", "Error");
    } finally {
      setCreating(false);
    }
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
              {currentWorkshop?.name || "Seleccionar taller"}
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
                  <div className="px-3 py-2 space-y-2">
                    <div className="text-sm text-industrial-400 text-center">
                      No workshops available
                    </div>
                    <button
                      onClick={() => {
                        setShowWorkshopMenu(false);
                        setShowCreateModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 hover:from-primary-500/30 hover:to-accent-500/30 text-primary-400 hover:text-primary-300 border border-primary-500/30 transition-all duration-300 text-sm font-medium"
                    >
                      <BuildingIcon className="w-4 h-4" />
                      Create Workshop
                    </button>
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
                <div className="border-t border-slate-700/50 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowWorkshopMenu(false);
                      setShowCreateModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-primary-300 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">Create New Workshop</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Workshop Modal - Rendered via Portal */}
      {showCreateModal && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            margin: 0,
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="card max-w-md w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0 pb-4 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-industrial-100">
                Create New Workshop
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateData({ name: "", description: "", monthly_token_limit: 100000 });
                }}
                className="text-industrial-400 hover:text-industrial-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-2">
                  Workshop Name *
                </label>
                <input
                  type="text"
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="My Workshop"
                  className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="Workshop description..."
                  className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-2">
                  Monthly Token Limit
                </label>
                <input
                  type="number"
                  value={createData.monthly_token_limit}
                  onChange={(e) => setCreateData({ ...createData, monthly_token_limit: parseInt(e.target.value) || 100000 })}
                  min="0"
                  className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
                <p className="text-xs text-industrial-500 mt-1">
                  Maximum tokens that can be used per month for this workshop
                </p>
              </div>

              <div className="flex gap-3 pt-4 flex-shrink-0 border-t border-slate-700/50 mt-4">
                <button
                  onClick={handleCreateWorkshop}
                  disabled={creating || !createData.name.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creando..." : "Crear taller"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateData({ name: "", description: "", monthly_token_limit: 100000 });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

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
                  <p className="text-sm font-bold text-white">
                    {user?.username || "User Account"}
                  </p>
                  <p className="text-xs text-slate-400">{user?.email || "user@example.com"}</p>
                  {isPlatformAdmin && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-warning-500/20 text-warning-400 rounded">
                      Platform Admin
                    </span>
                  )}
                </div>
                {isPlatformAdmin && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/admin");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm text-warning-300 hover:bg-gradient-to-r hover:from-warning-500/20 hover:to-error-500/20 hover:text-warning-200 transition-all duration-300"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" />
                    </svg>
                    <span className="font-medium">Admin Panel</span>
                  </button>
                )}
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
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      window.open("https://docs.example.com", "_blank");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                    type="button"
                  >
                    📖 Documentation
                  </button>
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      window.open("https://youtube.com/playlist?list=example", "_blank");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                    type="button"
                  >
                    🎥 Video Tutorials
                  </button>
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      window.open("mailto:support@example.com?subject=Support Request", "_blank");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                    type="button"
                  >
                    💬 Contact Support
                  </button>
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      window.open("https://github.com/your-repo/issues/new", "_blank");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 hover:text-white transition-all duration-300"
                    type="button"
                  >
                    🐛 Report Issue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
