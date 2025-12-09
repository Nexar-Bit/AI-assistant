import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../api/chat";
import { useWorkshopStore } from "../../stores/workshop.store";
import { usePermissions } from "../../hooks/usePermissions";
import { ViewerDashboard } from "./ViewerDashboard";
import type { DashboardStats } from "../../api/chat";

export function DashboardPage() {
  const { currentWorkshop } = useWorkshopStore();
  const { canAccess, currentWorkshopRole } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is a viewer - must be after all hooks
  const isViewer = currentWorkshopRole === "viewer" || (!canAccess.chat && !canAccess.vehicles && !canAccess.history);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentWorkshop) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats(currentWorkshop.id);
        setStats(data);
      } catch (err: any) {
        // If 404, the endpoint might not be deployed yet - silently use default stats
        if (err.response?.status === 404) {
          setStats({
            total_consultations: 0,
            tokens_used_this_month: 0,
            resolved_count: 0,
            pending_count: 0,
            recent_activity: [],
          });
          // Don't show error for 404 - endpoint not deployed yet
        } else {
          console.error("Failed to load dashboard stats:", err);
          setError(err.response?.data?.detail || "No se pudieron cargar las estadísticas del panel");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [currentWorkshop]);

  // If user is a viewer, show the viewer-specific dashboard
  // This check must be after all hooks to comply with Rules of Hooks
  if (isViewer) {
    return <ViewerDashboard />;
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-industrial-100 mb-2">Panel de control</h1>
          <p className="text-industrial-400">
            Resumen de tu actividad de diagnósticos y métricas del sistema
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
          <p className="text-industrial-400 mt-4">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="card-hover border-warning-500/50">
          <p className="text-warning-400">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary-500/10">
                  <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-industrial-400 mb-1">Consultas totales</h3>
              <p className="text-2xl font-bold text-industrial-100">
                {stats?.total_consultations ?? 0}
              </p>
              <p className="text-xs text-industrial-500 mt-2">
                {stats && stats.total_consultations > 0 ? "Todo el tiempo" : "Sin datos aún"}
              </p>
            </div>

            <div className="card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-accent-500/10">
                  <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-industrial-400 mb-1">Tokens usados este mes</h3>
              <p className="text-2xl font-bold text-industrial-100">
                {stats?.tokens_used_this_month.toLocaleString() ?? 0}
              </p>
              <p className="text-xs text-industrial-500 mt-2">Este mes</p>
            </div>

            <div className="card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-success-500/10">
                  <svg className="w-6 h-6 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-industrial-400 mb-1">Resueltas</h3>
              <p className="text-2xl font-bold text-industrial-100">
                {stats?.resolved_count ?? 0}
              </p>
              <p className="text-xs text-industrial-500 mt-2">Problemas resueltos</p>
            </div>

            <div className="card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-warning-500/10">
                  <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-industrial-400 mb-1">Pendientes</h3>
              <p className="text-2xl font-bold text-industrial-100">
                {stats?.pending_count ?? 0}
              </p>
              <p className="text-xs text-industrial-500 mt-2">Esperando resolución</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-industrial-100 mb-4">Actividad reciente</h2>
              {stats && stats.recent_activity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_activity.map((activity) => (
                    <Link
                      key={activity.id}
                      to={`/chat?thread=${activity.id}`}
                      className="block p-3 rounded-lg card-industrial hover:bg-industrial-700/50 hover:border-primary-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-industrial-200 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-industrial-400 mt-1">
                            {activity.license_plate} • {activity.status}
                          </p>
                          {activity.last_message_at && (
                            <p className="text-xs text-industrial-500 mt-1">
                              {new Date(activity.last_message_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {activity.is_resolved && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-success-500/20 text-success-400">
                            Resuelto
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-industrial-400">
                  No hay consultas recientes
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-industrial-100 mb-4">Acciones rápidas</h2>
              <div className="space-y-3">
                <Link
                  to="/chat"
                  className="flex items-center gap-3 p-3 rounded-lg card-industrial hover:bg-industrial-700/50 hover:border-primary-500/50 transition-all cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-primary-500/10">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-industrial-200">Iniciar nuevo chat</span>
                </Link>
                <Link
                  to="/history"
                  className="flex items-center gap-3 p-3 rounded-lg card-industrial hover:bg-industrial-700/50 hover:border-primary-500/50 transition-all cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-accent-500/10">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-industrial-200">Ver historial</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


