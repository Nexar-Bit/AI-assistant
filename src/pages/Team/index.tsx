import React, { useEffect, useState, useMemo } from "react";
import { getWorkshopMembers, updateMemberRole, removeMember, addMember } from "../../api/workshops";
import { useWorkshopStore } from "../../stores/workshop.store";
import { useNotification } from "../../components/layout/NotificationProvider";
import { useAuthStore } from "../../stores/auth.store";
import { formatDateTime } from "../../utils/formatters";
import { PermissionGate } from "../../components/common/PermissionGate";
import type { WorkshopMember } from "../../api/workshops";

// Helper to decode JWT and get user ID
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || payload.user_id || null;
  } catch {
    return null;
  }
}

export function TeamPage() {
  const { currentWorkshop } = useWorkshopStore();
  const { accessToken } = useAuthStore();
  const { showSuccess, showCritical } = useNotification();
  const [members, setMembers] = useState<WorkshopMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<WorkshopMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMemberData, setAddMemberData] = useState({
    email: "",
    role: "member" as "owner" | "admin" | "technician" | "member" | "viewer",
  });

  const currentUserId = useMemo(() => getUserIdFromToken(accessToken), [accessToken]);

  useEffect(() => {
    if (currentWorkshop) {
      loadMembers();
    } else {
      setLoading(false);
    }
  }, [currentWorkshop]);

  const loadMembers = async () => {
    if (!currentWorkshop) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getWorkshopMembers(currentWorkshop.id);
      setMembers(response.members);
    } catch (err: any) {
      console.error("Failed to load members:", err);
      setError(err.response?.data?.detail || "No se pudieron cargar los miembros del equipo");
      showCritical(err.response?.data?.detail || "No se pudieron cargar los miembros del equipo", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!currentWorkshop || !editingMember || !selectedRole) return;

    try {
      const updated = await updateMemberRole(
        currentWorkshop.id,
        editingMember.user_id,
        selectedRole as any
      );
      setMembers(members.map((m) => (m.id === updated.id ? { ...m, role: updated.role } : m)));
      setEditingMember(null);
      setSelectedRole("");
      showSuccess("Rol de miembro actualizado exitosamente", "Éxito");
    } catch (err: any) {
      console.error("Failed to update role:", err);
      showCritical(err.response?.data?.detail || "No se pudo actualizar el rol del miembro", "Error");
    }
  };

  const handleAddMember = async () => {
    if (!currentWorkshop || !addMemberData.email.trim()) return;

    try {
      const newMember = await addMember(currentWorkshop.id, {
        email: addMemberData.email,
        role: addMemberData.role,
      });
      setMembers([...members, newMember]);
      setShowAddModal(false);
      setAddMemberData({ email: "", role: "member" });
      showSuccess("Miembro agregado exitosamente", "Éxito");
    } catch (err: any) {
      console.error("Failed to add member:", err);
      showCritical(err.response?.data?.detail || "No se pudo agregar el miembro", "Error");
    }
  };

  const handleRemoveMember = async (member: WorkshopMember) => {
    if (!currentWorkshop) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar a ${member.user?.username || member.user_id} del equipo?`)) {
      return;
    }

    try {
      await removeMember(currentWorkshop.id, member.user_id);
      setMembers(members.filter((m) => m.id !== member.id));
      showSuccess("Miembro eliminado exitosamente", "Éxito");
    } catch (err: any) {
      console.error("Failed to remove member:", err);
      showCritical(err.response?.data?.detail || "No se pudo eliminar el miembro", "Error");
    }
  };

  const startEdit = (member: WorkshopMember) => {
    setEditingMember(member);
    setSelectedRole(member.role);
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setSelectedRole("");
  };

  const canAddMember = () => {
    if (!currentUserId) return false;
    const currentUserMember = members.find((m) => m.user_id === currentUserId);
    return currentUserMember && ["admin", "owner"].includes(currentUserMember.role);
  };

  const canEdit = (member: WorkshopMember) => {
    if (!currentUserId) return false;
    // Only admin and owner can edit
    const currentUserMember = members.find((m) => m.user_id === currentUserId);
    if (!currentUserMember) return false;
    return ["admin", "owner"].includes(currentUserMember.role) && member.role !== "owner";
  };

  const canRemove = (member: WorkshopMember) => {
    if (!currentUserId) return false;
    // Only admin and owner can remove, and cannot remove owner or yourself
    const currentUserMember = members.find((m) => m.user_id === currentUserId);
    if (!currentUserMember) return false;
    if (member.role === "owner") return false;
    if (member.user_id === currentUserId) return false;
    return ["admin", "owner"].includes(currentUserMember.role);
  };

  if (!currentWorkshop) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <div className="card text-center py-12">
          <p className="text-industrial-400">Por favor selecciona un taller para ver los miembros del equipo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-industrial-100 mb-2">Equipo</h1>
          <p className="text-industrial-400">
            Gestiona los miembros del equipo del taller y sus roles
          </p>
        </div>
        <PermissionGate permission="addTeamMember">
          {canAddMember() && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar miembro
            </button>
          )}
        </PermissionGate>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 animate-slide-up">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-industrial-400">Cargando miembros del equipo...</p>
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-industrial-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-industrial-400 font-medium">No se encontraron miembros del equipo.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-industrial-800/50 border-b border-industrial-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Se unió
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/50">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-industrial-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                        {member.user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-industrial-100">
                          {member.user?.username || "Usuario desconocido"}
                        </div>
                        {member.user_id === currentUserId && (
                          <span className="text-xs text-primary-400">(Tú)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {member.user?.email || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.role === "owner"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : member.role === "admin"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : member.role === "technician"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : member.role === "member"
                          ? "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.role === "owner"
                            ? "bg-purple-400"
                            : member.role === "admin"
                            ? "bg-blue-400"
                            : member.role === "technician"
                            ? "bg-green-400"
                            : member.role === "member"
                            ? "bg-slate-400"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      {member.role === "owner" ? "Propietario" : 
                       member.role === "admin" ? "Administrador" :
                       member.role === "technician" ? "Técnico" :
                       member.role === "member" ? "Miembro" :
                       member.role === "viewer" ? "Visualizador" :
                       member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${member.is_active ? "bg-emerald-400" : "bg-red-400"}`}
                      ></span>
                      {member.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {member.created_at ? formatDateTime(member.created_at) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PermissionGate permission="updateTeamMemberRole">
                        {canEdit(member) && (
                          <button
                            onClick={() => startEdit(member)}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            Editar rol
                          </button>
                        )}
                      </PermissionGate>
                      <PermissionGate permission="removeTeamMember">
                        {canRemove(member) && (
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-industrial-100">
                Agregar miembro al equipo
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddMemberData({ email: "", role: "member" });
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
                <label className="text-xs font-medium text-industrial-300 mb-1 block">
                  Correo del usuario *
                </label>
                <input
                  type="email"
                  value={addMemberData.email}
                  onChange={(e) => setAddMemberData({ ...addMemberData, email: e.target.value })}
                  className="input-industrial"
                  placeholder="usuario@ejemplo.com"
                  required
                />
                <p className="text-xs text-industrial-500 mt-1">
                  El usuario debe tener una cuenta existente. Si no existe, debe registrarse primero o ser creado por un administrador de plataforma.
                </p>
                <div className="mt-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                  <p className="text-xs text-primary-300 font-medium mb-1">💡 ¿No sabes cómo crear técnicos?</p>
                  <p className="text-xs text-primary-400">
                    Consulta el manual en <code className="text-primary-300">MANUAL_CREACION_TECNICOS.md</code> o contacta al administrador de plataforma.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-industrial-300 mb-1 block">
                  Rol
                </label>
                <select
                  value={addMemberData.role}
                  onChange={(e) => setAddMemberData({ ...addMemberData, role: e.target.value as any })}
                  className="input-industrial"
                >
                  <option value="viewer">Visualizador</option>
                  <option value="member">Miembro</option>
                  <option value="technician">Técnico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddMember}
                  disabled={!addMemberData.email.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar miembro
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddMemberData({ email: "", role: "member" });
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

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-industrial-100">
                Editar rol del miembro
              </h2>
              <button
                onClick={cancelEdit}
                className="text-industrial-400 hover:text-industrial-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-industrial-400 mb-2">
                  Actualizando rol para: <span className="font-semibold text-industrial-200">{editingMember.user?.username || editingMember.user_id}</span>
                </p>
                <label className="text-xs font-medium text-industrial-300 mb-1 block">
                  Rol
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input-industrial"
                >
                  <option value="viewer">Visualizador</option>
                  <option value="member">Miembro</option>
                  <option value="technician">Técnico</option>
                  <option value="admin">Administrador</option>
                  {editingMember.role === "owner" && <option value="owner">Propietario</option>}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateRole}
                  disabled={!selectedRole || selectedRole === editingMember.role}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Actualizar rol
                </button>
                <button
                  onClick={cancelEdit}
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

