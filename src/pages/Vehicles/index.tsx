import React, { useEffect, useState } from "react";
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle, searchVehicles } from "../../api/vehicles";
import { useWorkshopStore } from "../../stores/workshop.store";
import { useNotification } from "../../components/layout/NotificationProvider";
import { formatDateTime } from "../../utils/formatters";
import { PermissionGate } from "../../components/common/PermissionGate";
import type { Vehicle } from "../../api/vehicles";

export function VehiclesPage() {
  const { currentWorkshop } = useWorkshopStore();
  const { showSuccess, showCritical, showWarning, showInfo } = useNotification();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    year: undefined as number | undefined,
    vin: "",
    current_km: undefined as number | undefined,
    engine_type: "",
    fuel_type: "",
  });

  const loadVehicles = React.useCallback(async () => {
    if (!currentWorkshop) {
      setLoading(false);
      setVehicles([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Loading vehicles for workshop:", currentWorkshop.id); // Debug log
      const response = await fetchVehicles({
        workshop_id: currentWorkshop.id,
        license_plate: searchQuery || undefined,
      });
      console.log("Vehicles API response:", response); // Debug log
      const vehiclesList = response.vehicles || [];
      console.log("Vehicles list:", vehiclesList); // Debug log
      setVehicles(vehiclesList);
    } catch (err: any) {
      console.error("Failed to load vehicles:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      }); // Debug log
      const errorMessage = err.response?.data?.detail || err.message || "No se pudieron cargar los vehículos";
      setError(errorMessage);
      // Only show critical notification for non-404 errors (empty list is not an error)
      if (err.response?.status !== 404) {
        showCritical(errorMessage, "Error");
      }
      setVehicles([]); // Ensure vehicles is set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [currentWorkshop, searchQuery, showCritical]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleCreate = async () => {
    if (!currentWorkshop || !formData.license_plate.trim()) return;

    try {
      const vehicle = await createVehicle({
        ...formData,
        workshop_id: currentWorkshop.id,
      });
      setVehicles([vehicle, ...vehicles]);
      setShowCreateModal(false);
      resetForm();
      showSuccess("Vehículo creado exitosamente", "Éxito");
    } catch (err: any) {
      console.error("Failed to create vehicle:", err);
      
      // Handle 409 Conflict - vehicle already exists
      if (err.response?.status === 409) {
        const errorMessage = err.response?.data?.detail || "Ya existe un vehículo con esta placa";
        showWarning(errorMessage, "Vehículo ya existe");
        
        // Try to find and display the existing vehicle
        try {
          const existingVehicles = await searchVehicles(formData.license_plate);
          if (existingVehicles.length > 0) {
            // Refresh the vehicles list to show the existing vehicle
            await loadVehicles();
            showInfo("Vehículo existente encontrado y mostrado en la lista", "Vehículo encontrado");
            setShowCreateModal(false);
            resetForm();
          }
        } catch (searchError) {
          console.error("Failed to search for existing vehicle:", searchError);
          // Still close modal and reset form even if search fails
          setShowCreateModal(false);
          resetForm();
        }
      } else {
        // Handle other errors
        showCritical(err.response?.data?.detail || "No se pudo crear el vehículo", "Error");
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingVehicle || !formData.license_plate.trim()) return;

    try {
      const updated = await updateVehicle(editingVehicle.id, formData);
      setVehicles(vehicles.map((v) => (v.id === updated.id ? updated : v)));
      setEditingVehicle(null);
      resetForm();
      showSuccess("Vehículo actualizado exitosamente", "Éxito");
    } catch (err: any) {
      console.error("Failed to update vehicle:", err);
      showCritical(err.response?.data?.detail || "No se pudo actualizar el vehículo", "Error");
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este vehículo?")) return;

    try {
      await deleteVehicle(vehicleId);
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      showSuccess("Vehículo eliminado exitosamente", "Éxito");
    } catch (err: any) {
      console.error("Failed to delete vehicle:", err);
      showCritical(err.response?.data?.detail || "No se pudo eliminar el vehículo", "Error");
    }
  };

  const resetForm = () => {
    setFormData({
      license_plate: "",
      make: "",
      model: "",
      year: undefined,
      vin: "",
      current_km: undefined,
      engine_type: "",
      fuel_type: "",
    });
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      license_plate: vehicle.license_plate || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year,
      vin: vehicle.vin || "",
      current_km: vehicle.current_km,
      engine_type: vehicle.engine_type || "",
      fuel_type: vehicle.fuel_type || "",
    });
  };

  const cancelEdit = () => {
    setEditingVehicle(null);
    resetForm();
  };

  if (!currentWorkshop) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <div className="card text-center py-12">
          <p className="text-industrial-400">Por favor selecciona un taller para ver los vehículos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-industrial-100 mb-2">Vehículos</h1>
          <p className="text-industrial-400">
            Gestiona tu base de datos de vehículos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar vehículo
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-industrial-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa..."
            className="input-industrial w-full pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 animate-slide-up">
          {error}
        </div>
      )}

      {loading && vehicles.length === 0 ? (
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-industrial-400">Cargando vehículos...</p>
          </div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-industrial-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <p className="text-industrial-400 font-medium mb-4">No se encontraron vehículos.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Agregar tu primer vehículo
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-industrial-800/50 border-b border-industrial-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Placa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Marca y Modelo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Año
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Kilometraje Actual
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Tipo de Combustible
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Creado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/50">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-industrial-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-industrial-100">
                    {vehicle.license_plate}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {vehicle.make && vehicle.model
                      ? `${vehicle.make} ${vehicle.model}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {vehicle.year || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {vehicle.current_km ? vehicle.current_km.toLocaleString() + " km" : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {vehicle.fuel_type || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {formatDateTime(vehicle.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PermissionGate permission="editVehicle">
                        <button
                          onClick={() => startEdit(vehicle)}
                          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          Editar
                        </button>
                      </PermissionGate>
                      <PermissionGate permission="deleteVehicle">
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Eliminar
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingVehicle) && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-industrial-100">
                {editingVehicle ? "Editar vehículo" : "Nuevo vehículo"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  cancelEdit();
                }}
                className="text-industrial-400 hover:text-industrial-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-industrial-300 mb-1 block">
                    Placa *
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) =>
                      setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })
                    }
                    className="input-industrial"
                    placeholder="ABC123"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-industrial-300 mb-1 block">
                    Kilometraje Actual
                  </label>
                  <input
                    type="number"
                    value={formData.current_km || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_km: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="input-industrial"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-industrial-300 mb-1 block">Marca</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="input-industrial"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-industrial-300 mb-1 block">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="input-industrial"
                    placeholder="Camry"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-industrial-300 mb-1 block">Año</label>
                  <input
                    type="number"
                    value={formData.year || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="input-industrial"
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-industrial-300 mb-1 block">Tipo de Combustible</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="input-industrial"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Gasoline">Gasolina</option>
                    <option value="Diesel">Diésel</option>
                    <option value="Electric">Eléctrico</option>
                    <option value="Hybrid">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-industrial-300 mb-1 block">Tipo de Motor</label>
                <input
                  type="text"
                  value={formData.engine_type}
                  onChange={(e) => setFormData({ ...formData, engine_type: e.target.value })}
                  className="input-industrial"
                  placeholder="2.0L Turbo"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-industrial-300 mb-1 block">VIN</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  className="input-industrial"
                  placeholder="Número VIN"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingVehicle ? handleUpdate : handleCreate}
                  disabled={!formData.license_plate.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingVehicle ? "Actualizar vehículo" : "Crear vehículo"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    cancelEdit();
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

