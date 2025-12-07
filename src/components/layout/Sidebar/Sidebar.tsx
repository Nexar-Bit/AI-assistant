/** Sidebar with modern vibrant design and latest icons */

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useWorkshopStore } from "../../../stores/workshop.store";
import { PermissionGate } from "../../common/PermissionGate";
// Modern icon components (inline SVGs - latest design)
const HomeIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MessageSquareIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CarIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 5c-.3-.8-1-1.3-1.8-1.3H7.1c-.8 0-1.5.5-1.8 1.3L3.5 11c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M5 17h14" />
  </svg>
);

const UsersIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SparklesIcon = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: HomeIcon,
    gradient: "from-blue-500 to-cyan-500",
    permission: "dashboard" as const,
  },
  {
    to: "/chat",
    label: "Chat",
    icon: MessageSquareIcon,
    gradient: "from-purple-500 to-pink-500",
    permission: "chat" as const,
  },
  {
    to: "/history",
    label: "History",
    icon: ClockIcon,
    gradient: "from-orange-500 to-amber-500",
    permission: "history" as const,
  },
  {
    to: "/vehicles",
    label: "Vehicles",
    icon: CarIcon,
    gradient: "from-green-500 to-emerald-500",
    permission: "vehicles" as const,
  },
  {
    to: "/team",
    label: "Team",
    icon: UsersIcon,
    gradient: "from-indigo-500 to-blue-500",
    permission: "team" as const,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: SettingsIcon,
    gradient: "from-gray-500 to-slate-500",
    permission: "settings" as const,
  },
];

export function Sidebar() {
  const { currentWorkshop } = useWorkshopStore();
  // Track if user manually toggled (to prevent auto-resize from overriding)
  const [userToggled, setUserToggled] = useState(false);
  // On tablet (768px-1024px), start collapsed. On desktop (>1024px), start expanded
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-collapse on tablet on mount (only if user hasn't manually toggled)
  useEffect(() => {
    if (userToggled) return; // Don't auto-adjust if user manually toggled
    
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width < 1024) {
        setIsCollapsed(true);
      } else if (width >= 1024) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [userToggled]);

  return (
    <aside
      className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } flex-shrink-0 relative hidden md:flex shadow-2xl`}
    >
      {/* Workshop Logo/Header - Vibrant Design */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-primary-600/20 to-accent-500/20">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            {currentWorkshop?.logo_url ? (
              <img
                src={currentWorkshop.logo_url}
                alt={`${currentWorkshop.name} logo`}
                className="w-10 h-10 rounded-xl object-contain flex-shrink-0 ring-2 ring-primary-500/30 shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                currentWorkshop?.primary_color
                  ? ""
                  : "from-primary-500 via-accent-400 to-primary-600"
              } shadow-lg ring-2 ring-white/20 ${
                currentWorkshop?.logo_url ? "hidden" : ""
              }`}
              style={{
                background: currentWorkshop?.primary_color
                  ? `linear-gradient(135deg, ${currentWorkshop.primary_color}, ${currentWorkshop.primary_color}dd)`
                  : undefined,
              }}
            >
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            {currentWorkshop && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate drop-shadow-lg">
                  {currentWorkshop.name}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            {currentWorkshop?.logo_url ? (
              <img
                src={currentWorkshop.logo_url}
                alt={`${currentWorkshop.name} logo`}
                className="w-10 h-10 rounded-xl object-contain ring-2 ring-primary-500/30 shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                currentWorkshop?.primary_color
                  ? ""
                  : "from-primary-500 via-accent-400 to-primary-600"
              } shadow-lg ring-2 ring-white/20 ${
                currentWorkshop?.logo_url ? "hidden" : ""
              }`}
              style={{
                background: currentWorkshop?.primary_color
                  ? `linear-gradient(135deg, ${currentWorkshop.primary_color}, ${currentWorkshop.primary_color}dd)`
                  : undefined,
              }}
            >
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation - Modern Vibrant Design */}
      <nav className="flex-1 py-4 space-y-2 px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <PermissionGate
              key={item.to}
              permission={item.permission}
              showNothing={true}
            >
              <div
                className="relative group"
              onMouseEnter={() => {
                // Clear any existing timeout
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setHoveredItem(item.to);
              }}
              onMouseLeave={() => {
                // Add a small delay before hiding to allow moving to tooltip
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredItem(null);
                }, 100);
              }}
            >
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `relative flex items-center ${isCollapsed ? "justify-center" : "justify-start gap-3 px-3"} w-full h-14 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-primary-500/50 scale-105`
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-105"
                  }`
                }
              >
                {/* Icon with gradient background when active */}
                <div className={`flex items-center ${isCollapsed ? "justify-center" : ""} ${isCollapsed ? "w-full" : "flex-shrink-0"}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                {/* Label when expanded */}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}

                {/* Active indicator glow */}
                {hoveredItem === item.to && (
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-20 blur-sm -z-10`} />
                )}
              </NavLink>

              {/* Hover Tooltip - Modern Design - With extended hover area */}
              {hoveredItem === item.to && (
                <div 
                  className="absolute left-full top-0 bottom-0 w-48 z-50"
                  onMouseEnter={() => {
                    // Keep tooltip visible when hovering over it
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                      hoverTimeoutRef.current = null;
                    }
                    setHoveredItem(item.to);
                  }}
                  onMouseLeave={() => {
                    // Hide tooltip when leaving the tooltip area
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredItem(null);
                    }, 100);
                  }}
                >
                  {/* Visible tooltip */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 animate-slide-up pointer-events-auto">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 shadow-2xl whitespace-nowrap backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {item.label}
                        </span>
                      </div>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-r-4 border-r-slate-800 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                  </div>
                </div>
              )}
            </div>
            </PermissionGate>
          );
        })}
      </nav>

      {/* Collapse Toggle - Modern Design */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={() => {
            setUserToggled(true);
            setIsCollapsed(!isCollapsed);
          }}
          className="w-full flex items-center justify-center h-10 rounded-xl text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/20 hover:to-accent-500/20 transition-all duration-300 hover:scale-105"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}


