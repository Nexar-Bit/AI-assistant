import { useState, useEffect } from "react";
import { useNotification } from "../../components/layout/NotificationProvider";
import {
  listWorkshops,
  updateWorkshop,
  blockWorkshop,
  unblockWorkshop,
  deleteWorkshop,
  type AdminWorkshop,
  type WorkshopUpdate,
} from "../../api/adminWorkshops";

export function WorkshopsManagement() {
  const { showSuccess, showCritical } = useNotification();
  const [workshops, setWorkshops] = useState<AdminWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkshop, setEditingWorkshop] = useState<AdminWorkshop | null>(null);
  const [filters, setFilters] = useState({
    is_active: "",
  });
  const [formData, setFormData] = useState<WorkshopUpdate>({
    name: "",
    description: "",
    is_active: true,
    monthly_token_limit: 100000,
  });

  useEffect(() => {
    loadWorkshops();
  }, [filters]);

  const loadWorkshops = async () => {
    setLoading(true);
    try {
      const is_active = filters.is_active === "" ? undefined : filters.is_active === "true";
      const data = await listWorkshops(is_active);
      setWorkshops(data);
    } catch (err: any) {
      console.error("Failed to load workshops:", err);
      showCritical(err.response?.data?.detail || "No se pudieron cargar los talleres", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingWorkshop) return;

    try {
      const updateData: WorkshopUpdate = {};
      
      if (formData.name && formData.name !== editingWorkshop.name) {
        updateData.name = formData.name;
      }
      if (formData.description !== editingWorkshop.description) {
        updateData.description = formData.description || null;
      }
      if (formData.is_active !== editingWorkshop.is_active) {
        updateData.is_active = formData.is_active;
      }
      if (formData.monthly_token_limit !== editingWorkshop.monthly_token_limit) {
        updateData.monthly_token_limit = formData.monthly_token_limit;
      }

      if (Object.keys(updateData).length === 0) {
        showCritical("No hay cambios para guardar", "Error");
        return;
      }

      await updateWorkshop(editingWorkshop.id, updateData);
      showSuccess("Taller actualizado exitosamente", "Éxito");
      setEditingWorkshop(null);
      setFormData({
        name: "",
        description: "",
        is_active: true,
        monthly_token_limit: 100000,
      });
      loadWorkshops();
    } catch (err: any) {
      console.error("Failed to update workshop:", err);
      showCritical(err.response?.data?.detail || "No se pudo actualizar el taller", "Error");
    }
  };

  const handleBlock = async (workshopId: string, workshopName: string) => {
    if (!confirm(`¿Estás seguro de que deseas bloquear el taller "${workshopName}"?`)) {
      return;
    }

    try {
      await blockWorkshop(workshopId);
      showSuccess("Taller bloqueado exitosamente", "Éxito");
      loadWorkshops();
    } catch (err: any) {
      console.error("Failed to block workshop:", err);
      showCritical(err.response?.data?.detail || "No se pudo bloquear el taller", "Error");
    }
  };

  const handleUnblock = async (workshopId: string, workshopName: string) => {
    if (!confirm(`¿Estás seguro de que deseas desbloquear el taller "${workshopName}"?`)) {
      return;
    }

    try {
      await unblockWorkshop(workshopId);
      showSuccess("Taller desbloqueado exitosamente", "Éxito");
      loadWorkshops();
    } catch (err: any) {
      console.error("Failed to unblock workshop:", err);
      showCritical(err.response?.data?.detail || "No se pudo desbloquear el taller", "Error");
    }
  };

  const handleDelete = async (workshopId: string, workshopName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el taller "${workshopName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteWorkshop(workshopId);
      showSuccess("Taller eliminado exitosamente", "Éxito");
      loadWorkshops();
    } catch (err: any) {
      console.error("Failed to delete workshop:", err);
      showCritical(err.response?.data?.detail || "No se pudo eliminar el taller", "Error");
    }
  };

  const startEdit = (workshop: AdminWorkshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      name: workshop.name,
      description: workshop.description || "",
      is_active: workshop.is_active,
      monthly_token_limit: workshop.monthly_token_limit,
    });
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-industrial-400">Cargando talleres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-industrial-100 mb-2">Gestión de Talleres</h2>
        <p className="text-sm text-industrial-400">
          Gestionar talleres, bloquear/desbloquear, y configurar límites de tokens
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-2">Estado</label>
            <select
              value={filters.is_active}
              onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
              className="input-industrial w-full"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workshops Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-industrial-800/50 border-b border-industrial-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                Taller
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                Tokens Usados
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                Límite Mensual
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-800/50">
            {workshops.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-industrial-400">
                  No se encontraron talleres
                </td>
              </tr>
            ) : (
              workshops.map((workshop) => (
                <tr key={workshop.id} className="hover:bg-industrial-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-industrial-100">{workshop.name}</div>
                      {workshop.description && (
                        <div className="text-xs text-industrial-400 mt-1">{workshop.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        workshop.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {workshop.is_active ? "Activo" : "Bloqueado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {workshop.tokens_used_this_month.toLocaleString()} / {workshop.monthly_token_limit.toLocaleString()}
                    <div className="w-full bg-industrial-700 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          (workshop.tokens_used_this_month / workshop.monthly_token_limit) * 100 > 90
                            ? "bg-red-500"
                            : (workshop.tokens_used_this_month / workshop.monthly_token_limit) * 100 > 70
                            ? "bg-warning-500"
                            : "bg-primary-500"
                        }`}
                        style={{
                          width: `${Math.min((workshop.tokens_used_this_month / workshop.monthly_token_limit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {workshop.monthly_token_limit.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(workshop)}
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Editar
                      </button>
                      {workshop.is_active ? (
                        <button
                          onClick={() => handleBlock(workshop.id, workshop.name)}
                          className="text-xs text-warning-400 hover:text-warning-300 transition-colors"
                        >
                          Bloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblock(workshop.id, workshop.name)}
                          className="text-xs text-success-400 hover:text-success-300 transition-colors"
                        >
                          Desbloquear
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(workshop.id, workshop.name)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingWorkshop && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-industrial-100">Editar Taller</h2>
              <button
                onClick={() => {
                  setEditingWorkshop(null);
                  setFormData({
                    name: "",
                    description: "",
                    is_active: true,
                    monthly_token_limit: 100000,
                  });
                }}
                className="text-industrial-400 hover:text-industrial-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Nombre del Taller *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-industrial w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-industrial w-full h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Límite Mensual de Tokens *
                </label>
                <input
                  type="number"
                  value={formData.monthly_token_limit}
                  onChange={(e) => setFormData({ ...formData, monthly_token_limit: parseInt(e.target.value) || 0 })}
                  className="input-industrial w-full"
                  required
                  min={0}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm text-industrial-300">
                  Taller activo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={!formData.name || formData.monthly_token_limit < 0}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    setEditingWorkshop(null);
                    setFormData({
                      name: "",
                      description: "",
                      is_active: true,
                      monthly_token_limit: 100000,
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

