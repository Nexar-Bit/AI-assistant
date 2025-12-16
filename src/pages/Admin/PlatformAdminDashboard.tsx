/**
 * Platform Admin Dashboard - Main view for platform administrators
 * Shows hierarchy: Workshops > Users, with quick stats and actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../components/layout/NotificationProvider';
import { fetchWorkshopsAdmin, toggleWorkshopActiveStatusAdmin, deleteWorkshopAdmin, getAllWorkshopMemberships, type WorkshopAdmin } from '../../api/adminWorkshops';
import { fetchUsersAdmin, toggleUserActiveStatusAdmin, type UserAdmin } from '../../api/adminUsers';
import { getPendingRegistrations, type PendingRegistration } from '../../api/admin';
import { Button } from '../../components/common/Button';

interface PlatformAdminDashboardProps {
  onTabChange?: (tab: 'dashboard' | 'registrations' | 'users' | 'workshops' | 'prompts') => void;
}

export function PlatformAdminDashboard({ onTabChange }: PlatformAdminDashboardProps) {
  const { showSuccess, showCritical } = useNotification();
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState<WorkshopAdmin[]>([]);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [workshopMemberships, setWorkshopMemberships] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedWorkshop, setExpandedWorkshop] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [workshopsData, usersData, pendingData, membershipsData] = await Promise.all([
        fetchWorkshopsAdmin(),
        fetchUsersAdmin(),
        getPendingRegistrations().catch(() => []),
        getAllWorkshopMemberships().catch(() => ({ workshop_users: {} })),
      ]);
      setWorkshops(workshopsData);
      setUsers(usersData);
      setPendingRegistrations(pendingData);
      setWorkshopMemberships(membershipsData.workshop_users || {});
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error cargando datos', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getUsersByWorkshop = (workshopId: string) => {
    // Get user IDs for this workshop from memberships
    const userIds = workshopMemberships[workshopId] || [];
    // Filter users to only include those in this workshop
    return users.filter(u => userIds.includes(u.id));
  };

  const handleToggleWorkshop = async (workshopId: string) => {
    try {
      await toggleWorkshopActiveStatusAdmin(workshopId);
      showSuccess('Estado del taller actualizado', 'Éxito');
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error actualizando taller', 'Error');
    }
  };

  const handleDeleteWorkshop = async (workshopId: string, workshopName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el taller "${workshopName}"? Esta acción es irreversible y eliminará todos los datos asociados.`)) return;
    try {
      await deleteWorkshopAdmin(workshopId);
      showSuccess('Taller eliminado exitosamente', 'Éxito');
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error eliminando taller', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-industrial-400">Cargando...</div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const activeWorkshops = workshops.filter(w => w.is_active).length;

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="card bg-gradient-to-r from-primary-900/20 to-accent-900/20 border-primary-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-industrial-100 mb-1">
              🛡️ Panel de Administración de Plataforma
            </h1>
            <p className="text-sm text-industrial-400">
              Control global de la plataforma - Gestiona talleres, usuarios y configuraciones
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => onTabChange?.('prompts')}>
              ⚙️ Prompts Globales
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-industrial-900/50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-industrial-100">{workshops.length}</div>
              <div className="text-xs text-industrial-400">Talleres ({activeWorkshops} activos)</div>
            </div>
          </div>
        </div>

        <div className="card bg-industrial-900/50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-industrial-100">{totalUsers}</div>
              <div className="text-xs text-industrial-400">Usuarios ({activeUsers} activos)</div>
            </div>
          </div>
        </div>

        <div className="card bg-industrial-900/50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-warning-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-industrial-100">{pendingRegistrations.length}</div>
              <div className="text-xs text-industrial-400">Registros pendientes</div>
            </div>
          </div>
        </div>

        <div className="card bg-industrial-900/50">
          <button
            onClick={() => onTabChange?.('registrations')}
            className="w-full h-full flex items-center gap-3 text-left hover:bg-industrial-800/50 transition-colors rounded-lg p-1"
          >
            <div className="h-12 w-12 rounded-lg bg-success-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-industrial-100">Aprobar registros</div>
              <div className="text-xs text-industrial-400">Gestionar solicitudes</div>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button onClick={() => onTabChange?.('workshops')}>+ Gestión de Talleres</Button>
        <Button onClick={() => onTabChange?.('users')} variant="secondary">+ Gestión de Usuarios</Button>
        <Button onClick={() => onTabChange?.('prompts')} variant="secondary">⚙️ Prompts Globales</Button>
      </div>

      {/* Workshops Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-industrial-100">Talleres y Usuarios</h2>
          <p className="text-sm text-industrial-400">Haz clic en un taller para ver sus usuarios</p>
        </div>

        {workshops.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-industrial-400 mb-4">No hay talleres registrados</p>
            <Button onClick={() => onTabChange?.('workshops')}>Crear primer taller</Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {workshops.map((workshop) => {
              const workshopUsers = getUsersByWorkshop(workshop.id);
              const isExpanded = expandedWorkshop === workshop.id;

              return (
                <div key={workshop.id} className="card hover:border-primary-500/30 transition-colors">
                  {/* Workshop Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedWorkshop(isExpanded ? null : workshop.id)}
                      className="flex-1 flex items-center gap-4 text-left"
                    >
                      <div className={`h-3 w-3 rounded-full ${workshop.is_active ? 'bg-success-400' : 'bg-error-400'}`} />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-industrial-100">{workshop.name}</h3>
                        <p className="text-sm text-industrial-400">
                          {workshopUsers.length} usuarios • {workshop.monthly_token_limit.toLocaleString()} tokens/mes
                        </p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-industrial-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onTabChange?.('workshops')}
                        title="Ir a gestión avanzada de talleres"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={workshop.is_active ? 'secondary' : 'primary'}
                        onClick={() => handleToggleWorkshop(workshop.id)}
                      >
                        {workshop.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteWorkshop(workshop.id, workshop.name)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  {/* Workshop Users (Expanded) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-industrial-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-industrial-300">Usuarios del Taller</h4>
                        <Button size="sm" variant="secondary" onClick={() => onTabChange?.('users')}>
                          Ver todos los usuarios
                        </Button>
                      </div>
                      {workshopUsers.length === 0 ? (
                        <p className="text-sm text-industrial-500 italic">No hay usuarios en este taller</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {workshopUsers.slice(0, 6).map((user) => (
                            <div key={user.id} className="flex items-center gap-2 p-2 bg-industrial-900/50 rounded border border-industrial-800">
                              <div className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-success-400' : 'bg-error-400'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-industrial-200 truncate">{user.username}</p>
                                <p className="text-xs text-industrial-500 truncate">{user.email}</p>
                              </div>
                              <span className="text-xs text-industrial-400 capitalize">{user.role}</span>
                            </div>
                          ))}
                          {workshopUsers.length > 6 && (
                            <div className="flex items-center justify-center p-2 bg-industrial-900/30 rounded border border-dashed border-industrial-700">
                              <p className="text-xs text-industrial-400">+{workshopUsers.length - 6} más</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
      `}</style>
    </div>
  );
}

