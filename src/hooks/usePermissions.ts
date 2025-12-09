import { useMemo } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useWorkshopStore, type WorkshopRole } from "../stores/workshop.store";

/**
 * Hook for role-based access control (RBAC)
 * Provides permission checks based on user's global role and workshop-specific role
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const currentWorkshop = useWorkshopStore((state) => state.currentWorkshop);
  const currentWorkshopRole = useWorkshopStore((state) => state.currentWorkshopRole);

  // Role hierarchy (higher number = more permissions)
  const roleHierarchy: Record<string, number> = {
    viewer: 0,
    member: 1,
    technician: 2,
    admin: 3,
    owner: 4,
  };

  // Global role hierarchy
  const globalRoleHierarchy: Record<string, number> = {
    viewer: 0,
    technician: 1,
    admin: 2,
  };

  /**
   * Check if user has a specific global role
   */
  const hasGlobalRole = (role: "admin" | "technician" | "viewer"): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  /**
   * Check if user has at least a specific global role level
   */
  const hasGlobalRoleAtLeast = (minRole: "admin" | "technician" | "viewer"): boolean => {
    if (!user) return false;
    const userLevel = globalRoleHierarchy[user.role] || 0;
    const requiredLevel = globalRoleHierarchy[minRole] || 0;
    return userLevel >= requiredLevel;
  };

  /**
   * Check if user has a specific workshop role
   */
  const hasWorkshopRole = (role: WorkshopRole): boolean => {
    if (!currentWorkshopRole) return false;
    return currentWorkshopRole === role;
  };

  /**
   * Check if user has at least a specific workshop role level
   */
  const hasWorkshopRoleAtLeast = (minRole: WorkshopRole): boolean => {
    if (!currentWorkshopRole) return false;
    const userLevel = roleHierarchy[currentWorkshopRole] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;
    return userLevel >= requiredLevel;
  };

  /**
   * Check if user can perform an action based on required role
   */
  const can = (requiredRole: WorkshopRole | "admin"): boolean => {
    // Admin global role can do everything
    if (hasGlobalRole("admin")) return true;

    // For workshop-specific actions, check workshop role
    if (requiredRole !== "admin") {
      return hasWorkshopRoleAtLeast(requiredRole);
    }

    // For admin-only actions, check global role
    return hasGlobalRole("admin");
  };

  /**
   * Check if user can access a specific feature
   * Based on role specifications:
   * - Owner (4): Full control, can delete workshop
   * - Admin (3): Manages members/settings, cannot delete workshop
   * - Technician (2): Manages vehicles, chat/diagnostics, no member/settings management
   * - Member (1): View and participate in chats, cannot create/edit vehicles, limited access
   * - Viewer (0): Read-only, cannot create/edit/delete, cannot access chat (only view history)
   */
  const canAccess = {
    // Dashboard - everyone can access
    dashboard: true,

    // Chat - member or higher (viewers cannot access chat)
    // Members can view and participate, technicians+ can do everything
    chat: hasWorkshopRoleAtLeast("member") && !hasWorkshopRole("viewer"),

    // Vehicles - technician or higher (members and viewers can only view)
    vehicles: hasWorkshopRoleAtLeast("member"), // All can view, but create/edit requires technician+

    // History - everyone can view (including viewers for read-only)
    history: hasWorkshopRoleAtLeast("viewer"),

    // Team management - admin or owner only
    team: can("admin"),

    // Settings - admin or owner only
    settings: can("admin"),

    // Admin panel - global admin only
    admin: hasGlobalRole("admin"),

    // Create vehicles - technician or higher (members cannot create)
    createVehicle: can("technician"),

    // Edit vehicles - technician or higher (members cannot edit)
    editVehicle: can("technician"),

    // Delete vehicles - technician or higher (members cannot delete)
    deleteVehicle: can("technician"),

    // Add team members - admin or owner only
    addTeamMember: can("admin"),

    // Update team member roles - admin or owner only
    updateTeamMemberRole: can("admin"),

    // Remove team members - admin or owner only
    removeTeamMember: can("admin"),

    // Update workshop settings - admin or owner only
    updateWorkshopSettings: can("admin"),

    // Update workshop customization - admin or owner only
    updateWorkshopCustomization: can("admin"),

    // Delete workshop - owner only
    deleteWorkshop: hasWorkshopRole("owner"),

    // Delete chat threads - technician or higher (members can participate but not delete)
    deleteChat: can("technician"),

    // Export data - technician or higher (members cannot export)
    exportData: can("technician"),

    // View reports - everyone can view (including viewers)
    viewReports: hasWorkshopRoleAtLeast("viewer"),

    // Send messages in chat - member or higher (viewers cannot send)
    sendChatMessage: hasWorkshopRoleAtLeast("member") && !hasWorkshopRole("viewer"),

    // Create chat sessions - member or higher (viewers cannot create)
    createChatSession: hasWorkshopRoleAtLeast("member") && !hasWorkshopRole("viewer"),
    
    // Token management - SOLO admin/owner del taller
    viewTokenUsage: can("admin"),
    viewTokenCounter: can("admin"), // Contador de tokens solo para admin/owner
    manageTokenLimits: can("owner"),
    
    // AI Providers
    viewAIProviders: can("admin"),
    manageAIProviders: can("admin"),
  };

  return {
    user,
    currentWorkshop,
    currentWorkshopRole,
    hasGlobalRole,
    hasGlobalRoleAtLeast,
    hasWorkshopRole,
    hasWorkshopRoleAtLeast,
    can,
    canAccess,
    isAdmin: hasGlobalRole("admin"),
    isWorkshopAdmin: hasWorkshopRoleAtLeast("admin"),
    isWorkshopOwner: hasWorkshopRole("owner"),
  };
}

