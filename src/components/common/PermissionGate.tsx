import React from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../hooks/usePermissions";

interface PermissionGateProps {
  /**
   * Required role to see the content
   * - "admin" = global admin only
   * - Other roles = workshop role check
   */
  requiredRole?: "admin" | "owner" | "admin" | "technician" | "member" | "viewer";
  
  /**
   * Required permission from canAccess object
   */
  permission?: keyof ReturnType<typeof usePermissions>["canAccess"];
  
  /**
   * Fallback content to show if permission is denied
   */
  fallback?: React.ReactNode;
  
  /**
   * Show nothing if permission denied (default)
   */
  showNothing?: boolean;
  
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGate({
  requiredRole,
  permission,
  fallback,
  showNothing = true,
  children,
}: PermissionGateProps) {
  const { t } = useTranslation();
  const { can, canAccess } = usePermissions();

  let hasPermission = true;

  if (permission) {
    hasPermission = canAccess[permission];
  } else if (requiredRole) {
    hasPermission = can(requiredRole as any);
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showNothing) {
      return null;
    }
    return (
      <div className="text-center py-8 text-industrial-400">
        <p>{t("common.noPermission")}</p>
      </div>
    );
  }

  return <>{children}</>;
}

