import React from "react";
import { usePermissions } from "../../hooks/usePermissions";
import { PermissionGate } from "../../components/common/PermissionGate";
import { useWorkshopStore } from "../../stores/workshop.store";

/**
 * Dashboard view specifically designed for Viewer role
 * Shows read-only information and clearly indicates restrictions
 */
export function ViewerDashboard() {
  const { currentWorkshop } = useWorkshopStore();
  const { canAccess } = usePermissions();

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header with Role Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Dashboard
          </h1>
          <p className="text-industrial-400">
            Welcome to your read-only dashboard
          </p>
        </div>
        <div className="px-4 py-2 bg-viewer-500/20 border border-viewer-500/30 rounded-lg">
          <span className="text-viewer-400 font-semibold text-sm">VIEWER ROLE</span>
        </div>
      </div>

      {/* Access Restrictions Notice */}
      <div className="card bg-warning-500/10 border-warning-500/30">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-warning-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-warning-400 mb-2">Read-Only Access</h3>
            <p className="text-sm text-industrial-300">
              As a <strong className="text-warning-400">viewer</strong>, you have read-only access to the dashboard. 
              You cannot create, edit, or delete any data. Contact your administrator if you need additional permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Workshop Info */}
      {currentWorkshop && (
        <div className="card">
          <h2 className="text-xl font-bold text-industrial-100 mb-4">Workshop Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-industrial-400 mb-1">Workshop Name</p>
              <p className="text-industrial-100 font-semibold">{currentWorkshop.name}</p>
            </div>
            <div>
              <p className="text-sm text-industrial-400 mb-1">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                currentWorkshop.is_active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${currentWorkshop.is_active ? "bg-emerald-400" : "bg-red-400"}`}></span>
                {currentWorkshop.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            {currentWorkshop.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-industrial-400 mb-1">Description</p>
                <p className="text-industrial-200">{currentWorkshop.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Cards - Read Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-industrial-400">Total Consultations</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">-</p>
          <p className="text-xs text-industrial-500 mt-1">Read-only view</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-industrial-400">Tokens Used</span>
            <span className="text-2xl">🎫</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">-</p>
          <p className="text-xs text-industrial-500 mt-1">Read-only view</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-industrial-400">Resolved</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-2xl font-bold text-green-400">-</p>
          <p className="text-xs text-industrial-500 mt-1">Read-only view</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-industrial-400">Pending</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">-</p>
          <p className="text-xs text-industrial-500 mt-1">Read-only view</p>
        </div>
      </div>

      {/* Quick Actions - Disabled for Viewer */}
      <div className="card">
        <h2 className="text-xl font-bold text-industrial-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PermissionGate permission="chat">
            <button className="btn-primary w-full">
              💬 Start New Chat
            </button>
          </PermissionGate>

          <PermissionGate permission="vehicles">
            <button className="btn-primary w-full">
              🚗 Add Vehicle
            </button>
          </PermissionGate>

          <PermissionGate permission="team">
            <button className="btn-primary w-full">
              👥 Manage Team
            </button>
          </PermissionGate>
        </div>
        <div className="mt-4 p-4 bg-industrial-800/50 rounded-lg border border-industrial-700/50">
          <p className="text-sm text-industrial-400 text-center">
            <svg className="w-5 h-5 text-industrial-500 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quick actions are not available for viewer role. Upgrade to technician or admin for full access.
          </p>
        </div>
      </div>

      {/* Feature Access Overview */}
      <div className="card">
        <h2 className="text-xl font-bold text-industrial-100 mb-4">Your Access Level</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-success-500/10 border border-success-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-industrial-100 font-medium">View Dashboard</span>
            </div>
            <span className="text-xs text-success-400 font-semibold">ALLOWED</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg opacity-60">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-industrial-100 font-medium">Chat & History</span>
            </div>
            <span className="text-xs text-red-400 font-semibold">RESTRICTED</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg opacity-60">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-industrial-100 font-medium">Vehicle Management</span>
            </div>
            <span className="text-xs text-red-400 font-semibold">RESTRICTED</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg opacity-60">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-industrial-100 font-medium">Team & Settings</span>
            </div>
            <span className="text-xs text-red-400 font-semibold">RESTRICTED</span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="card bg-primary-500/10 border-primary-500/30">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-primary-400 mb-2">Need More Access?</h3>
            <p className="text-sm text-industrial-300 mb-3">
              Contact your workshop administrator to upgrade your role:
            </p>
            <div className="space-y-2 text-sm text-industrial-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                <strong>Technician:</strong> Access to chat, history, and vehicle management
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                <strong>Admin:</strong> Full access including team management and settings
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

