import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { usePermissions } from "../../hooks/usePermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Required role to access this route
   * - "admin" = global admin only
   * - Other roles = workshop role check
   */
  requiredRole?: "admin" | "owner" | "admin" | "technician" | "member" | "viewer";
  /**
   * Required permission to access this route
   */
  requiredPermission?: keyof ReturnType<typeof usePermissions>["canAccess"];
  /**
   * Redirect to this path if access denied (default: "/")
   */
  redirectTo?: string;
}

/**
 * Route protection component that checks authentication and permissions
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { can, canAccess } = usePermissions();

  // Check authentication
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions if required
  if (requiredPermission) {
    if (!canAccess[requiredPermission]) {
      return <Navigate to={redirectTo} replace />;
    }
  } else if (requiredRole) {
    if (!can(requiredRole as any)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}

