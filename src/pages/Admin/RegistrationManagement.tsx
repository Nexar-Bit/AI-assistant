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
import { fetchWorkshopsAdmin, type WorkshopAdmin } from '../../api/adminWorkshops';

export function RegistrationManagement() {
  const { showSuccess, showCritical } = useNotification();
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [approvalData, setApprovalData] = useState({
    workshop_id: '',
    workshop_role: 'member',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [registrationsData, workshopsData] = await Promise.all([
        getPendingRegistrations(),
        fetchWorkshopsAdmin({ is_active: true }),
      ]);
      setRegistrations(registrationsData);
      setWorkshops(workshopsData);
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error cargando datos', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (registration: PendingRegistration) => {
    setSelectedRegistration(registration);
    setApprovalData({
      workshop_id: '',
      workshop_role: 'member',
    });
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRegistration) return;

    if (!approvalData.workshop_id) {
      showCritical('Debe seleccionar un taller para asignar al usuario', 'Error');
      return;
    }

    try {
      const result = await approveRegistration(selectedRegistration.id, {
        approved: true,
        workshop_id: approvalData.workshop_id,
        workshop_role: approvalData.workshop_role,
      });
      
      showSuccess(
        `Usuario ${selectedRegistration.username} aprobado y asignado al taller exitosamente`,
        'Aprobado'
      );
      setShowApproveModal(false);
      setSelectedRegistration(null);
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error aprobando registro', 'Error');
    }
  };

  const handleReject = async (userId: string, username: string) => {
    if (!confirm(`¿Rechazar el registro de ${username}? Esta acción eliminará al usuario permanentemente.`)) return;
    try {
      await approveRegistration(userId, { approved: false });
      showSuccess(`Registro de ${username} rechazado`, 'Rechazado');
      loadData();
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
                    onClick={() => openApproveModal(reg)}
                    className="px-4 py-2 bg-success-600 hover:bg-success-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Aprobar y Asignar
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

      {/* Approve Modal */}
      {showApproveModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-industrial-100">
                  Aprobar Registro: {selectedRegistration.username}
                </h2>
                <p className="text-sm text-industrial-400 mt-1">
                  Asigna el usuario a un taller y define su rol
                </p>
              </div>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRegistration(null);
                }}
                className="text-industrial-400 hover:text-industrial-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-industrial-900 rounded-lg">
              <h3 className="text-sm font-semibold text-industrial-300 mb-2">Información del Usuario</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-industrial-400">Usuario:</span>
                  <span className="text-sm text-industrial-100 font-medium">{selectedRegistration.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-industrial-400">Email:</span>
                  <span className="text-sm text-industrial-100">{selectedRegistration.email}</span>
                </div>
                {selectedRegistration.registration_message && (
                  <div className="mt-3 pt-3 border-t border-industrial-800">
                    <span className="text-xs text-industrial-500 block mb-1">Mensaje de registro:</span>
                    <p className="text-sm text-industrial-300">{selectedRegistration.registration_message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Workshop Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Taller <span className="text-error-400">*</span>
                </label>
                <select
                  value={approvalData.workshop_id}
                  onChange={(e) => setApprovalData({ ...approvalData, workshop_id: e.target.value })}
                  className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar taller...</option>
                  {workshops.map((workshop) => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name} {!workshop.is_active && '(Inactivo)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-industrial-500 mt-1">
                  El usuario será añadido como miembro de este taller
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Rol en el Taller <span className="text-error-400">*</span>
                </label>
                <select
                  value={approvalData.workshop_role}
                  onChange={(e) => setApprovalData({ ...approvalData, workshop_role: e.target.value })}
                  className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="member">Miembro (Member) - Acceso básico</option>
                  <option value="viewer">Visor (Viewer) - Solo lectura</option>
                  <option value="technician">Técnico (Technician) - Diagnósticos y consultas</option>
                  <option value="admin">Administrador (Admin) - Gestión del taller</option>
                  <option value="owner">Propietario (Owner) - Control total</option>
                </select>
                <p className="text-xs text-industrial-500 mt-1">
                  Define qué permisos tendrá el usuario en el taller
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-industrial-800">
              <button
                onClick={handleApprove}
                disabled={!approvalData.workshop_id}
                className="flex-1 px-4 py-2.5 bg-success-600 hover:bg-success-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Aprobar y Asignar
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRegistration(null);
                }}
                className="px-6 py-2.5 bg-industrial-700 hover:bg-industrial-600 text-industrial-200 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

