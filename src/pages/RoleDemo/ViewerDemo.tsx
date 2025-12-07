import React from "react";
import { usePermissions } from "../../hooks/usePermissions";
import { PermissionGate } from "../../components/common/PermissionGate";

/**
 * Viewer Role Demo Page
 * 
 * This page demonstrates what a user with "viewer" role sees in the system.
 * Viewers have read-only access with very limited permissions.
 */
export function ViewerDemo() {
  const { user, currentWorkshopRole, canAccess } = usePermissions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary mb-2">
                Viewer Role Interface
              </h1>
              <p className="text-industrial-400">
                This is what a user with <span className="text-primary-400 font-semibold">viewer</span> role sees
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-viewer-500/20 border border-viewer-500/30 rounded-lg">
                <span className="text-viewer-400 font-semibold text-sm">VIEWER ROLE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="card">
          <h2 className="text-xl font-bold text-industrial-100 mb-4">Current User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-industrial-400 mb-1">Global Role</p>
              <p className="text-industrial-100 font-semibold">{user?.role || "Not logged in"}</p>
            </div>
            <div>
              <p className="text-sm text-industrial-400 mb-1">Workshop Role</p>
              <p className="text-industrial-100 font-semibold">{currentWorkshopRole || "No workshop selected"}</p>
            </div>
            <div>
              <p className="text-sm text-industrial-400 mb-1">Username</p>
              <p className="text-industrial-100 font-semibold">{user?.username || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-industrial-400 mb-1">Email</p>
              <p className="text-industrial-100 font-semibold">{user?.email || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Permissions Overview */}
        <div className="card">
          <h2 className="text-xl font-bold text-industrial-100 mb-4">Available Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(canAccess).map(([permission, hasAccess]) => (
              <div
                key={permission}
                className={`p-4 rounded-lg border ${
                  hasAccess
                    ? "bg-success-500/10 border-success-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-industrial-200 capitalize">
                    {permission.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  {hasAccess ? (
                    <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-industrial-400">
                  {hasAccess ? "✅ Allowed" : "❌ Not allowed"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Navigation Preview */}
        <div className="card">
          <h2 className="text-xl font-bold text-industrial-100 mb-4">Sidebar Navigation (What Viewer Sees)</h2>
          <div className="space-y-2">
            {[
              { to: "/", label: "Dashboard", permission: "dashboard", icon: "🏠" },
              { to: "/chat", label: "Chat", permission: "chat", icon: "💬" },
              { to: "/history", label: "History", permission: "history", icon: "📜" },
              { to: "/vehicles", label: "Vehicles", permission: "vehicles", icon: "🚗" },
              { to: "/team", label: "Team", permission: "team", icon: "👥" },
              { to: "/settings", label: "Settings", permission: "settings", icon: "⚙️" },
            ].map((item) => {
              const hasAccess = canAccess[item.permission as keyof typeof canAccess];
              return (
                <div
                  key={item.to}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    hasAccess
                      ? "bg-success-500/10 border-success-500/30"
                      : "bg-red-500/10 border-red-500/30 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-industrial-100 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasAccess ? (
                      <>
                        <span className="text-xs text-success-400 font-semibold">VISIBLE</span>
                        <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-red-400 font-semibold">HIDDEN</span>
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Access Matrix */}
        <div className="card">
          <h2 className="text-xl font-bold text-industrial-100 mb-4">Feature Access Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-industrial-700">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-industrial-300">Feature</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-industrial-300">Viewer</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-industrial-300">Technician</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-industrial-300">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800">
                {[
                  { feature: "View Dashboard", viewer: true, technician: true, admin: true },
                  { feature: "Start Chat Sessions", viewer: false, technician: true, admin: true },
                  { feature: "View Chat History", viewer: false, technician: true, admin: true },
                  { feature: "View Vehicles", viewer: false, technician: true, admin: true },
                  { feature: "Create/Edit Vehicles", viewer: false, technician: true, admin: true },
                  { feature: "Delete Vehicles", viewer: false, technician: false, admin: true },
                  { feature: "View Team Members", viewer: false, technician: false, admin: true },
                  { feature: "Add Team Members", viewer: false, technician: false, admin: true },
                  { feature: "Manage Team Roles", viewer: false, technician: false, admin: true },
                  { feature: "Workshop Settings", viewer: false, technician: false, admin: true },
                  { feature: "Workshop Customization", viewer: false, technician: false, admin: true },
                  { feature: "Export Data", viewer: false, technician: true, admin: true },
                  { feature: "Download PDF Reports", viewer: false, technician: true, admin: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-industrial-800/30">
                    <td className="px-4 py-3 text-sm text-industrial-200">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      {row.viewer ? (
                        <span className="text-success-400">✓</span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.technician ? (
                        <span className="text-success-400">✓</span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.admin ? (
                        <span className="text-success-400">✓</span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Permission Gates Demo */}
        <div className="card">
          <h2 className="text-xl font-bold text-industrial-100 mb-4">Live Permission Gates Demo</h2>
          <p className="text-sm text-industrial-400 mb-4">
            These buttons are wrapped in PermissionGate components. Only visible features will show:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PermissionGate permission="dashboard">
              <button className="btn-primary w-full">
                🏠 Dashboard (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="chat">
              <button className="btn-primary w-full">
                💬 Chat (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="history">
              <button className="btn-primary w-full">
                📜 History (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="vehicles">
              <button className="btn-primary w-full">
                🚗 Vehicles (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="team">
              <button className="btn-primary w-full">
                👥 Team (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="settings">
              <button className="btn-primary w-full">
                ⚙️ Settings (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="createVehicle">
              <button className="btn-secondary w-full">
                ➕ Create Vehicle (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="deleteVehicle">
              <button className="btn-danger w-full">
                🗑️ Delete Vehicle (Visible)
              </button>
            </PermissionGate>

            <PermissionGate permission="addTeamMember">
              <button className="btn-secondary w-full">
                ➕ Add Team Member (Visible)
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Restrictions Notice */}
        <div className="card bg-warning-500/10 border-warning-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-warning-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-warning-400 mb-2">Viewer Role Restrictions</h3>
              <ul className="space-y-2 text-sm text-industrial-300">
                <li>• <strong>Read-only access:</strong> Viewers can only view the dashboard</li>
                <li>• <strong>No chat access:</strong> Cannot start or view chat sessions</li>
                <li>• <strong>No vehicle management:</strong> Cannot view, create, edit, or delete vehicles</li>
                <li>• <strong>No team management:</strong> Cannot view or manage team members</li>
                <li>• <strong>No settings access:</strong> Cannot modify workshop settings or customization</li>
                <li>• <strong>No data export:</strong> Cannot export data or download PDF reports</li>
                <li>• <strong>Purpose:</strong> Viewers are typically used for read-only monitoring or auditing purposes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upgrade Instructions */}
        <div className="card bg-primary-500/10 border-primary-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-primary-400 mb-2">Need More Access?</h3>
              <p className="text-sm text-industrial-300 mb-3">
                If you need access to more features, contact your workshop administrator to upgrade your role:
              </p>
              <div className="space-y-2 text-sm text-industrial-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                  <strong>Technician:</strong> Can use chat, view history, manage vehicles
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                  <strong>Admin:</strong> Full access including team management and settings
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                  <strong>Owner:</strong> Complete control over the workshop
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

