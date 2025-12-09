/**
 * Registration Management - Admin panel for approving user registrations
 */

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/layout/NotificationProvider';
import {
  getPendingRegistrations,
  approveRegistration,
  type PendingRegistration,
} from '../../api/admin';

export function RegistrationManagement() {
  const { showSuccess, showCritical } = useNotification();
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await getPendingRegistrations();
      setRegistrations(data);
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error cargando registros', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, username: string) => {
    try {
      await approveRegistration(userId, true);
      showSuccess(`Usuario ${username} aprobado exitosamente`, 'Aprobado');
      loadRegistrations();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error aprobando registro', 'Error');
    }
  };

  const handleReject = async (userId: string, username: string) => {
    if (!confirm(`¿Rechazar el registro de ${username}?`)) return;
    try {
      await approveRegistration(userId, false);
      showSuccess(`Registro de ${username} rechazado`, 'Rechazado');
      loadRegistrations();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error rechazando registro', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p className="text-industrial-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-industrial-100">Registros Pendientes</h1>
        <p className="text-sm text-industrial-400 mt-1">
          Aprueba o rechaza solicitudes de registro
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="card">
          <p className="text-industrial-400 text-center py-8">
            No hay registros pendientes de aprobación
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-industrial-100">
                      {reg.username}
                    </h3>
                    <span className="px-2 py-0.5 bg-warning-500/20 text-warning-300 text-xs rounded">
                      Pendiente
                    </span>
                    {reg.email_verified && (
                      <span className="px-2 py-0.5 bg-success-500/20 text-success-300 text-xs rounded">
                        ✓ Email verificado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-industrial-400 mt-1">{reg.email}</p>
                  {reg.registration_message && (
                    <div className="mt-3 p-3 bg-industrial-900 rounded-lg">
                      <p className="text-xs text-industrial-500 mb-1">Mensaje:</p>
                      <p className="text-sm text-industrial-300">{reg.registration_message}</p>
                    </div>
                  )}
                  <p className="text-xs text-industrial-500 mt-2">
                    Registrado: {new Date(reg.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(reg.id, reg.username)}
                    className="px-4 py-2 bg-success-600 hover:bg-success-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(reg.id, reg.username)}
                    className="px-4 py-2 bg-error-600 hover:bg-error-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

