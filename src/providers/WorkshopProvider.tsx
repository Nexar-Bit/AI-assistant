/** Workshop provider for multi-tenant context */

import React, { createContext, useContext, useEffect } from "react";
import { useWorkshopStore } from "../stores/workshop.store";
import { useAuthStore } from "../stores/auth.store";
import { fetchWorkshops, getMyWorkshopRole } from "../api/workshops";
import { useWorkshopTheme } from "../hooks/useWorkshopTheme";
import type { WorkshopInfo } from "../types/api.types";

interface WorkshopContextValue {
  currentWorkshop: ReturnType<typeof useWorkshopStore>["currentWorkshop"];
  workshops: ReturnType<typeof useWorkshopStore>["workshops"];
  setCurrentWorkshop: ReturnType<typeof useWorkshopStore>["setCurrentWorkshop"];
  isLoading: boolean;
  error: string | null;
  refreshWorkshops: () => Promise<void>;
}

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

interface WorkshopProviderProps {
  children: React.ReactNode;
}

export function WorkshopProvider({ children }: WorkshopProviderProps) {
  const { currentWorkshop, workshops, setCurrentWorkshop, setWorkshops, setCurrentWorkshopRole } = useWorkshopStore();
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Apply workshop theme (primary color)
  useWorkshopTheme(currentWorkshop);

  // Fetch current user's role in the selected workshop
  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!currentWorkshop || !user) {
        setCurrentWorkshopRole(null);
        return;
      }

      try {
        const roleData = await getMyWorkshopRole(currentWorkshop.id);
        if (roleData && roleData.is_active) {
          setCurrentWorkshopRole(roleData.role);
        } else {
          setCurrentWorkshopRole(null);
        }
      } catch (err: any) {
        // Silently handle 403/404 - user might not be a member or endpoint might not exist
        if (err.response?.status === 403 || err.response?.status === 404) {
          setCurrentWorkshopRole(null);
        } else {
          console.error("Failed to fetch user role in workshop:", err);
          setCurrentWorkshopRole(null);
        }
      }
    };

    fetchUserRole();
  }, [currentWorkshop, user, setCurrentWorkshopRole]);

  const refreshWorkshops = async () => {
    // Only fetch if authenticated
    if (!isAuthenticated || !accessToken) {
      setError("Not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWorkshops();
      setWorkshops(response.workshops);
      
      // Auto-select first workshop if none selected
      if (!currentWorkshop && response.workshops.length > 0) {
        setCurrentWorkshop(response.workshops[0]);
      }
    } catch (err: any) {
      console.error("Failed to load workshops:", err);
      setError(err.response?.data?.detail || "Failed to load workshops");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize workshops from login response if available
  useEffect(() => {
    // This will be called when user logs in and workshops are in the login response
    // The login response workshops are already handled by the auth store
  }, []);

  useEffect(() => {
    // Only fetch workshops when authenticated
    if (isAuthenticated && accessToken) {
      refreshWorkshops();
    } else {
      // Clear workshops when not authenticated
      setWorkshops([]);
      setCurrentWorkshop(null);
    }
  }, [isAuthenticated, accessToken]);

  const value: WorkshopContextValue = {
    currentWorkshop,
    workshops,
    setCurrentWorkshop,
    isLoading,
    error,
    refreshWorkshops,
  };

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>;
}

export function useWorkshop() {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error("useWorkshop must be used within WorkshopProvider");
  }
  return context;
}

