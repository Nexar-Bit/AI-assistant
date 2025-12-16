import { useState, useEffect } from "react";
import { useNotification } from "../../components/layout/NotificationProvider";
import {
  listUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  type AdminUser,
  type UserCreate,
  type UserUpdate,
} from "../../api/adminUsers";

export function UsersManagement() {
  const { showSuccess, showCritical } = useNotification();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    role: "",
    is_active: "",
  });
  const [formData, setFormData] = useState<UserCreate>({
    username: "",
    email: "",
    password: "",
    role: "technician",
    is_active: true,
  });
  const [passwordReset, setPasswordReset] = useState({
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const role = filters.role || undefined;
      const is_active = filters.is_active === "" ? undefined : filters.is_active === "true";
      const data = await listUsers(role, is_active);
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      showCritical(err.response?.data?.detail || "No se pudieron cargar los usuarios", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (formData.password.length < 12) {
      showCritical("La contraseña debe tener al menos 12 caracteres", "Error");
      return;
    }

    try {
      await createUser(formData);
      showSuccess("Usuario creado exitosamente", "Éxito");
      setShowCreateModal(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "technician",
        is_active: true,
      });
      loadUsers();
    } catch (err: any) {
      console.error("Failed to create user:", err);
      showCritical(err.response?.data?.detail || "No se pudo crear el usuario", "Error");
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const updateData: UserUpdate = {
        username: formData.username !== editingUser.username ? formData.username : undefined,
        email: formData.email !== editingUser.email ? formData.email : undefined,
        role: formData.role !== editingUser.role ? formData.role : undefined,
        is_active: formData.is_active !== editingUser.is_active ? formData.is_active : undefined,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof UserUpdate] === undefined) {
          delete updateData[key as keyof UserUpdate];
        }
      });

      if (Object.keys(updateData).length === 0) {
        showCritical("No hay cambios para guardar", "Error");
        return;
      }

      await updateUser(editingUser.id, updateData);
      showSuccess("Usuario actualizado exitosamente", "Éxito");
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "technician",
        is_active: true,
      });
      loadUsers();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      showCritical(err.response?.data?.detail || "No se pudo actualizar el usuario", "Error");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (passwordReset.new_password.length < 12) {
      showCritical("La contraseña debe tener al menos 12 caracteres", "Error");
      return;
    }

    if (passwordReset.new_password !== passwordReset.confirm_password) {
      showCritical("Las contraseñas no coinciden", "Error");
      return;
    }

    try {
      await resetUserPassword(userId, { new_password: passwordReset.new_password });
      showSuccess("Contraseña restablecida exitosamente", "Éxito");
      setResettingPassword(null);
      setPasswordReset({ new_password: "", confirm_password: "" });
    } catch (err: any) {
      console.error("Failed to reset password:", err);
      showCritical(err.response?.data?.detail || "No se pudo restablecer la contraseña", "Error");
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      showSuccess("Usuario eliminado exitosamente", "Éxito");
      loadUsers();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      showCritical(err.response?.data?.detail || "No se pudo eliminar el usuario", "Error");
    }
  };

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Don't show password
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified,
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
          <p className="text-industrial-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-industrial-100 mb-2">Gestión de Usuarios</h2>
          <p className="text-sm text-industrial-400">
            Crear, editar, eliminar y gestionar usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setEditingUser(null);
            setFormData({
              username: "",
              email: "",
              password: "",
              role: "technician",
              is_active: true,
              email_verified: true,
            });
          }}
          className="btn-primary"
        >
          + Crear Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-2">Rol</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="input-industrial w-full"
            >
              <option value="">Todos</option>
              <option value="owner">Propietario (super admin)</option>
              <option value="admin">Administrador</option>
              <option value="technician">Técnico</option>
              <option value="viewer">Visualizador</option>
              <option value="member">Miembro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-2">Estado</label>
            <select
              value={filters.is_active}
              onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
              className="input-industrial w-full"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-0">
        <div className="max-h-[600px] overflow-y-auto">
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
                Límite Tokens
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-800/50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-industrial-400">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-industrial-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                        {user.username[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-industrial-100">{user.username}</div>
                        {!user.email_verified && (
                          <span className="text-xs text-warning-400">Email no verificado</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === "owner"
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          : user.role === "admin"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : user.role === "technician"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : user.role === "member"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      {user.role === "owner"
                        ? "Propietario"
                        : user.role === "admin"
                        ? "Administrador"
                        : user.role === "technician"
                        ? "Técnico"
                        : user.role === "member"
                        ? "Miembro"
                        : "Visualizador"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {user.daily_token_limit?.toLocaleString() ?? '10,000'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setResettingPassword(user.id)}
                        className="text-xs text-warning-400 hover:text-warning-300 transition-colors"
                      >
                        Reset Pass
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
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
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-industrial-100">
                {editingUser ? "Editar Usuario" : "Crear Usuario"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  setFormData({
                    username: "",
                    email: "",
                    password: "",
                    role: "technician",
                    is_active: true,
                    email_verified: true,
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
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-industrial w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-industrial w-full"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-industrial-300 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-industrial w-full"
                    required
                    minLength={12}
                  />
                  <p className="text-xs text-industrial-500 mt-1">
                    Mínimo 12 caracteres con mayúsculas, minúsculas, dígitos y caracteres especiales
                  </p>
                </div>
              )}

              <div>
            <label className="block text-sm font-medium text-industrial-300 mb-2">Rol global *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="input-industrial w-full"
                >
              <option value="owner">Propietario (super admin)</option>
              <option value="admin">Administrador</option>
              <option value="technician">Técnico</option>
              <option value="viewer">Visualizador</option>
              <option value="member">Miembro</option>
                </select>
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
                  Usuario activo
                </label>
              </div>

              {!editingUser && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="email_verified"
                    checked={formData.email_verified}
                    onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="email_verified" className="text-sm text-industrial-300">
                    Email verificado (usuarios creados por admin están pre-verificados)
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingUser ? handleUpdate : handleCreate}
                  disabled={!formData.username || !formData.email || (!editingUser && formData.password.length < 12)}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingUser ? "Actualizar" : "Crear"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUser(null);
                    setFormData({
                      username: "",
                      email: "",
                      password: "",
                      role: "technician",
                      is_active: true,
                      email_verified: true,
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

      {/* Password Reset Modal */}
      {resettingPassword && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-industrial-100">Restablecer Contraseña</h2>
              <button
                onClick={() => {
                  setResettingPassword(null);
                  setPasswordReset({ new_password: "", confirm_password: "" });
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
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={passwordReset.new_password}
                  onChange={(e) => setPasswordReset({ ...passwordReset, new_password: e.target.value })}
                  className="input-industrial w-full"
                  required
                  minLength={12}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={passwordReset.confirm_password}
                  onChange={(e) => setPasswordReset({ ...passwordReset, confirm_password: e.target.value })}
                  className="input-industrial w-full"
                  required
                  minLength={12}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleResetPassword(resettingPassword)}
                  disabled={
                    passwordReset.new_password.length < 12 ||
                    passwordReset.new_password !== passwordReset.confirm_password
                  }
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Restablecer
                </button>
                <button
                  onClick={() => {
                    setResettingPassword(null);
                    setPasswordReset({ new_password: "", confirm_password: "" });
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

