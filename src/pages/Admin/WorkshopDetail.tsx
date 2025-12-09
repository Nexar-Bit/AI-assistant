/**
 * Workshop Detail View - Shows detailed information grouped by technicians
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWorkshopDetail, type WorkshopDetail } from '../../api/admin';
import { useNotification } from '../../components/layout/NotificationProvider';
import { formatDateTime } from '../../utils/formatters';

export function WorkshopDetailView() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const { showCritical } = useNotification();
  const [detail, setDetail] = useState<WorkshopDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workshopId) {
      loadDetail();
    }
  }, [workshopId]);

  const loadDetail = async () => {
    if (!workshopId) return;
    
    setLoading(true);
    try {
      const data = await getWorkshopDetail(workshopId);
      setDetail(data);
    } catch (error: any) {
      console.error('Failed to load workshop detail:', error);
      showCritical(error.response?.data?.detail || 'Error cargando detalles del taller', 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p className="text-industrial-400">Cargando detalles del taller...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="card">
        <p className="text-industrial-400">No se encontraron detalles del taller.</p>
      </div>
    );
  }

  const { workshop, technicians } = detail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin"
            className="text-sm text-primary-400 hover:text-primary-300 mb-2 inline-block"
          >
            ← Volver a Administración
          </Link>
          <h1 className="text-2xl font-bold text-industrial-100">{workshop.name}</h1>
          <p className="text-sm text-industrial-400 mt-1">
            {workshop.description || 'Sin descripción'}
          </p>
        </div>
      </div>

      {/* Workshop Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-industrial-400 mb-1">Miembros totales</div>
          <div className="text-2xl font-bold text-industrial-100">{workshop.member_count}</div>
        </div>
        <div className="card">
          <div className="text-sm text-industrial-400 mb-1">Técnicos</div>
          <div className="text-2xl font-bold text-industrial-100">{workshop.technician_count}</div>
        </div>
        <div className="card">
          <div className="text-sm text-industrial-400 mb-1">Tokens usados (este mes)</div>
          <div className="text-2xl font-bold text-industrial-100">
            {workshop.tokens_used.toLocaleString()} / {workshop.tokens_limit.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-industrial-400 mb-1">Consultas activas</div>
          <div className="text-2xl font-bold text-industrial-100">{workshop.active_consultations}</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-industrial-400 mb-1">Total de consultas</div>
          <div className="text-xl font-bold text-industrial-100">{workshop.total_consultations}</div>
        </div>
        <div className="card">
          <div className="text-sm text-industrial-400 mb-1">Vehículos registrados</div>
          <div className="text-xl font-bold text-industrial-100">{workshop.vehicles_count}</div>
        </div>
        <div className="card">
          <div className="text-sm text-industrial-400 mb-1">Última actividad</div>
          <div className="text-sm font-medium text-industrial-200">
            {workshop.last_activity ? formatDateTime(workshop.last_activity) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Technicians Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold text-industrial-100 mb-4">
          Desglose por Técnicos
        </h2>
        {technicians.length === 0 ? (
          <p className="text-industrial-400 text-center py-8">
            No hay técnicos en este taller
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-industrial-800/50 border-b border-industrial-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                    Técnico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                    Consultas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                    Tokens usados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                    Vehículos creados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                    Última actividad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800/50">
                {technicians.map((tech) => (
                  <tr key={tech.user_id} className="hover:bg-industrial-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-industrial-100">
                          {tech.username}
                        </div>
                        <div className="text-xs text-industrial-400">{tech.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-industrial-300">
                      {tech.consultations_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-industrial-300">
                      {tech.tokens_used.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-industrial-300">
                      {tech.vehicles_created}
                    </td>
                    <td className="px-4 py-3 text-sm text-industrial-300">
                      {tech.last_activity ? formatDateTime(tech.last_activity) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

