/** Admin dashboard for workshop management - Groups information by workshops */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkshopsStats, type WorkshopStats } from "../../api/admin";
import { useNotification } from "../../components/layout/NotificationProvider";
import { formatDateTime } from "../../utils/formatters";
import { ActivityIcon, UsersIcon, SettingsIcon } from "../../components/icons/AutomotiveIcons";

export function WorkshopDashboard() {
  const { showCritical } = useNotification();
  const [workshops, setWorkshops] = useState<WorkshopStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    setLoading(true);
    try {
      const data = await getWorkshopsStats();
      setWorkshops(data);
    } catch (err: any) {
      console.error("Failed to load workshops:", err);
      showCritical(err.response?.data?.detail || "Error cargando talleres", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-industrial-100 mb-2">Talleres</h2>
        <p className="text-sm text-industrial-400">
          Información agrupada por talleres. Haz clic en un taller para ver detalles por técnicos.
        </p>
      </div>

      {loading ? (
        <div className="card">
          <p className="text-industrial-400 text-center py-8">Cargando talleres...</p>
        </div>
      ) : workshops.length === 0 ? (
        <div className="card">
          <p className="text-industrial-400 text-center py-8">No se encontraron talleres</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.map((workshop) => (
            <Link
              key={workshop.id}
              to={`/admin/workshops/${workshop.id}`}
              className="card block hover:bg-industrial-800/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-industrial-100">
                      {workshop.name}
                    </h3>
                    {workshop.description && (
                      <span className="text-sm text-industrial-500">
                        {workshop.description}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-industrial-500 mb-1">Miembros</div>
                      <div className="text-sm font-semibold text-industrial-200">
                        {workshop.member_count}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-industrial-500 mb-1">Técnicos</div>
                      <div className="text-sm font-semibold text-industrial-200">
                        {workshop.technician_count}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-industrial-500 mb-1">Tokens usados</div>
                      <div className="text-sm font-semibold text-industrial-200">
                        {workshop.tokens_used.toLocaleString()} / {workshop.tokens_limit.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-industrial-500 mb-1">Consultas activas</div>
                      <div className="text-sm font-semibold text-industrial-200">
                        {workshop.active_consultations} / {workshop.total_consultations}
                      </div>
                    </div>
                  </div>
                  
                  {workshop.last_activity && (
                    <div className="text-xs text-industrial-500 mt-3">
                      Última actividad: {formatDateTime(workshop.last_activity)}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <SettingsIcon size={20} className="text-industrial-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

