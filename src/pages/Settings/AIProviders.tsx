/**
 * AI Providers Management - Settings page for configuring AI providers
 */

import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useWorkshopStore } from '../../stores/workshop.store';
import { useNotification } from '../../components/layout/NotificationProvider';
import {
  fetchAIProviders,
  createAIProvider,
  updateAIProvider,
  deleteAIProvider,
  getWorkshopProviders,
  assignProviderToWorkshop,
  removeProviderFromWorkshop,
  type AIProvider,
  type WorkshopAIProvider,
  type CreateAIProviderRequest,
} from '../../api/aiProviders';

const PROVIDER_TYPES = [
  { value: 'openai', label: 'OpenAI (GPT)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'azure_openai', label: 'Azure OpenAI' },
  { value: 'local', label: 'Local Model' },
  { value: 'custom', label: 'Custom API' },
];

export function AIProvidersSettings() {
  const { canAccess, isAdmin } = usePermissions();
  const { currentWorkshop } = useWorkshopStore();
  const { showSuccess, showCritical } = useNotification();

  // State
  const [globalProviders, setGlobalProviders] = useState<AIProvider[]>([]);
  const [workshopProviders, setWorkshopProviders] = useState<WorkshopAIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAIProviderRequest>({
    name: '',
    provider_type: 'openai',
    api_key: '',
    api_endpoint: '',
    model_name: '',
    description: '',
    is_active: true,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [currentWorkshop?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load global providers if admin
      if (isAdmin) {
        const providers = await fetchAIProviders();
        setGlobalProviders(providers);
      }

      // Load workshop providers if workshop selected
      if (currentWorkshop?.id && canAccess.viewAIProviders) {
        const workshopProvs = await getWorkshopProviders(currentWorkshop.id);
        setWorkshopProviders(workshopProvs);
      }
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error cargando proveedores', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    try {
      await createAIProvider(formData);
      showSuccess('Proveedor creado exitosamente', 'Éxito');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error creando proveedor', 'Error');
    }
  };

  const handleUpdateProvider = async () => {
    if (!editingProvider) return;
    try {
      await updateAIProvider(editingProvider.id, formData);
      showSuccess('Proveedor actualizado exitosamente', 'Éxito');
      setEditingProvider(null);
      resetForm();
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error actualizando proveedor', 'Error');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await deleteAIProvider(id);
      showSuccess('Proveedor eliminado exitosamente', 'Éxito');
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error eliminando proveedor', 'Error');
    }
  };

  const handleAssignProvider = async (providerId: string) => {
    if (!currentWorkshop?.id) return;
    try {
      await assignProviderToWorkshop(currentWorkshop.id, {
        provider_id: providerId,
        priority: 0,
        is_enabled: true,
      });
      showSuccess('Proveedor asignado exitosamente', 'Éxito');
      setShowAssignModal(false);
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error asignando proveedor', 'Error');
    }
  };

  const handleRemoveProvider = async (providerId: string) => {
    if (!currentWorkshop?.id) return;
    if (!confirm('¿Desasignar este proveedor del taller?')) return;
    try {
      await removeProviderFromWorkshop(currentWorkshop.id, providerId);
      showSuccess('Proveedor desasignado exitosamente', 'Éxito');
      loadData();
    } catch (error: any) {
      showCritical(error.response?.data?.detail || 'Error desasignando proveedor', 'Error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider_type: 'openai',
      api_key: '',
      api_endpoint: '',
      model_name: '',
      description: '',
      is_active: true,
    });
  };

  const openEditModal = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      provider_type: provider.provider_type as any,
      api_endpoint: provider.api_endpoint || '',
      model_name: provider.model_name || '',
      description: provider.description || '',
      is_active: provider.is_active,
    });
  };

  if (!canAccess.viewAIProviders && !isAdmin) {
    return (
      <div className="card">
        <p className="text-industrial-400">No tienes permiso para ver esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <p className="text-industrial-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-100">Proveedores de IA</h1>
          <p className="text-sm text-industrial-400 mt-1">
            Configura qué modelos de IA puede usar tu taller
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium"
          >
            + Crear Proveedor
          </button>
        )}
      </div>

      {/* Workshop Providers */}
      {currentWorkshop && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-industrial-100">
              Proveedores de {currentWorkshop.name}
            </h2>
            {canAccess.manageAIProviders && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3 py-1.5 bg-industrial-700 hover:bg-industrial-600 text-industrial-200 rounded-lg transition-colors text-sm"
              >
                + Asignar Proveedor
              </button>
            )}
          </div>

          {workshopProviders.length === 0 ? (
            <p className="text-industrial-400 text-sm">No hay proveedores asignados a este taller.</p>
          ) : (
            <div className="space-y-3">
              {workshopProviders.map((wp) => (
                <div
                  key={wp.id}
                  className="flex items-center justify-between p-3 bg-industrial-800/50 rounded-lg border border-industrial-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-industrial-100">{wp.provider.name}</h3>
                      <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-xs rounded">
                        {PROVIDER_TYPES.find((t) => t.value === wp.provider.provider_type)?.label}
                      </span>
                      {!wp.is_enabled && (
                        <span className="px-2 py-0.5 bg-error-500/20 text-error-300 text-xs rounded">
                          Deshabilitado
                        </span>
                      )}
                    </div>
                    {wp.provider.model_name && (
                      <p className="text-xs text-industrial-400 mt-1">Modelo: {wp.provider.model_name}</p>
                    )}
                  </div>
                  {canAccess.manageAIProviders && (
                    <button
                      onClick={() => handleRemoveProvider(wp.ai_provider_id)}
                      className="px-3 py-1.5 bg-error-600 hover:bg-error-500 text-white rounded-lg transition-colors text-sm"
                    >
                      Desasignar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Global Providers (Admin only) */}
      {isAdmin && (
        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-100 mb-4">Proveedores Globales</h2>

          {globalProviders.length === 0 ? (
            <p className="text-industrial-400 text-sm">No hay proveedores globales configurados.</p>
          ) : (
            <div className="space-y-3">
              {globalProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 bg-industrial-800/50 rounded-lg border border-industrial-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-industrial-100">{provider.name}</h3>
                      <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-xs rounded">
                        {PROVIDER_TYPES.find((t) => t.value === provider.provider_type)?.label}
                      </span>
                      {!provider.is_active && (
                        <span className="px-2 py-0.5 bg-error-500/20 text-error-300 text-xs rounded">
                          Inactivo
                        </span>
                      )}
                      {provider.has_api_key && (
                        <span className="px-2 py-0.5 bg-success-500/20 text-success-300 text-xs rounded">
                          ✓ API Key
                        </span>
                      )}
                    </div>
                    {provider.description && (
                      <p className="text-xs text-industrial-400 mt-1">{provider.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(provider)}
                      className="px-3 py-1.5 bg-industrial-700 hover:bg-industrial-600 text-industrial-200 rounded-lg transition-colors text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProvider(provider.id)}
                      className="px-3 py-1.5 bg-error-600 hover:bg-error-500 text-white rounded-lg transition-colors text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProvider) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-industrial-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-industrial-100 mb-4">
                {editingProvider ? 'Editar Proveedor' : 'Crear Proveedor'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-industrial-300 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: OpenAI GPT-4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-industrial-300 mb-2">Tipo de Proveedor *</label>
                  <select
                    value={formData.provider_type}
                    onChange={(e) => setFormData({ ...formData, provider_type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {PROVIDER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-industrial-300 mb-2">API Key</label>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    className="w-full px-4 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-industrial-500 mt-1">Dejar vacío para no cambiar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-industrial-300 mb-2">Modelo</label>
                  <input
                    type="text"
                    value={formData.model_name}
                    onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                    className="w-full px-4 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="gpt-4, claude-3-opus, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-industrial-300 mb-2">Endpoint (opcional)</label>
                  <input
                    type="text"
                    value={formData.api_endpoint}
                    onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                    className="w-full px-4 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-industrial-300 mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-industrial-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Descripción opcional..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-industrial-600 bg-industrial-800 text-primary-600"
                  />
                  <label htmlFor="is_active" className="text-sm text-industrial-300">
                    Proveedor activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingProvider ? handleUpdateProvider : handleCreateProvider}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium"
                >
                  {editingProvider ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProvider(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-industrial-700 hover:bg-industrial-600 text-industrial-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-industrial-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-industrial-100 mb-4">Asignar Proveedor</h2>

              <div className="space-y-3">
                {globalProviders
                  .filter((p) => p.is_active)
                  .filter((p) => !workshopProviders.some((wp) => wp.ai_provider_id === p.id))
                  .map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleAssignProvider(provider.id)}
                      className="w-full text-left p-3 bg-industrial-900 hover:bg-industrial-700 border border-industrial-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-industrial-100">{provider.name}</span>
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-xs rounded">
                          {PROVIDER_TYPES.find((t) => t.value === provider.provider_type)?.label}
                        </span>
                      </div>
                      {provider.model_name && (
                        <p className="text-xs text-industrial-400 mt-1">Modelo: {provider.model_name}</p>
                      )}
                    </button>
                  ))}
              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="w-full mt-4 px-4 py-2 bg-industrial-700 hover:bg-industrial-600 text-industrial-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

