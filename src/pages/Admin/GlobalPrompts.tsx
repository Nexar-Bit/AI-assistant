import { useState, useEffect } from "react";
import { useNotification } from "../../components/layout/NotificationProvider";
import {
  getGlobalPrompts,
  getActiveGlobalPrompt,
  createGlobalPrompt,
  updateGlobalPrompt,
  deleteGlobalPrompt,
  type GlobalPrompt,
} from "../../api/prompts";

export function GlobalPromptsManagement() {
  const { showSuccess, showCritical } = useNotification();
  const [prompts, setPrompts] = useState<GlobalPrompt[]>([]);
  const [activePrompt, setActivePrompt] = useState<GlobalPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<GlobalPrompt | null>(null);
  const [formData, setFormData] = useState({
    prompt_text: "",
    name: "",
    is_active: true,
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const [allPrompts, active] = await Promise.all([
        getGlobalPrompts(),
        getActiveGlobalPrompt(),
      ]);
      setPrompts(allPrompts);
      setActivePrompt(active);
    } catch (err: any) {
      console.error("Failed to load prompts:", err);
      showCritical(err.response?.data?.detail || "No se pudieron cargar los prompts", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (formData.prompt_text.length < 10) {
      showCritical("El prompt debe tener al menos 10 caracteres", "Error");
      return;
    }

    try {
      await createGlobalPrompt({
        prompt_text: formData.prompt_text,
        name: formData.name || null,
        is_active: formData.is_active,
      });
      showSuccess("Prompt global creado exitosamente", "Éxito");
      setShowCreateModal(false);
      setFormData({ prompt_text: "", name: "", is_active: true });
      loadPrompts();
    } catch (err: any) {
      console.error("Failed to create prompt:", err);
      showCritical(err.response?.data?.detail || "No se pudo crear el prompt", "Error");
    }
  };

  const handleUpdate = async () => {
    if (!editingPrompt) return;
    if (formData.prompt_text.length < 10) {
      showCritical("El prompt debe tener al menos 10 caracteres", "Error");
      return;
    }

    try {
      await updateGlobalPrompt(editingPrompt.id, {
        prompt_text: formData.prompt_text,
        name: formData.name || null,
        is_active: formData.is_active,
      });
      showSuccess("Prompt global actualizado exitosamente", "Éxito");
      setEditingPrompt(null);
      setFormData({ prompt_text: "", name: "", is_active: true });
      loadPrompts();
    } catch (err: any) {
      console.error("Failed to update prompt:", err);
      showCritical(err.response?.data?.detail || "No se pudo actualizar el prompt", "Error");
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este prompt?")) return;

    try {
      await deleteGlobalPrompt(promptId);
      showSuccess("Prompt eliminado exitosamente", "Éxito");
      loadPrompts();
    } catch (err: any) {
      console.error("Failed to delete prompt:", err);
      showCritical(err.response?.data?.detail || "No se pudo eliminar el prompt", "Error");
    }
  };

  const startEdit = (prompt: GlobalPrompt) => {
    setEditingPrompt(prompt);
    setFormData({
      prompt_text: prompt.prompt_text,
      name: prompt.name || "",
      is_active: prompt.is_active,
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
          <p className="text-industrial-400">Cargando prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-industrial-100 mb-2">Prompts Globales de IA</h2>
          <p className="text-sm text-industrial-400">
            Configura el prompt base que se aplicará a todos los talleres. Solo puedes tener un prompt activo a la vez.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setEditingPrompt(null);
            setFormData({ prompt_text: "", name: "", is_active: true });
          }}
          className="btn-primary"
        >
          + Crear Prompt
        </button>
      </div>

      {/* Active Prompt */}
      {activePrompt && (
        <div className="card border-l-4 border-primary-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded">
                  ACTIVO
                </span>
                {activePrompt.name && (
                  <span className="text-sm font-semibold text-industrial-200">{activePrompt.name}</span>
                )}
              </div>
              <p className="text-sm text-industrial-300 whitespace-pre-wrap">{activePrompt.prompt_text}</p>
              <p className="text-xs text-industrial-500 mt-2">
                Versión {activePrompt.version} • Creado: {new Date(activePrompt.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => startEdit(activePrompt)}
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              Editar
            </button>
          </div>
        </div>
      )}

      {/* All Prompts List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-industrial-100 mb-4">Todos los Prompts</h3>
        {prompts.length === 0 ? (
          <p className="text-industrial-400 text-center py-8">No hay prompts configurados</p>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`p-4 rounded-lg border ${
                  prompt.is_active
                    ? "bg-primary-500/10 border-primary-500/30"
                    : "bg-industrial-800/50 border-industrial-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {prompt.is_active && (
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-300 text-xs rounded">
                          ACTIVO
                        </span>
                      )}
                      {prompt.name && (
                        <span className="text-sm font-semibold text-industrial-200">{prompt.name}</span>
                      )}
                    </div>
                    <p className="text-sm text-industrial-300 line-clamp-2">{prompt.prompt_text}</p>
                    <p className="text-xs text-industrial-500 mt-1">
                      Versión {prompt.version} • {new Date(prompt.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(prompt)}
                      className="text-xs text-primary-400 hover:text-primary-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPrompt) && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-industrial-100">
                {editingPrompt ? "Editar Prompt Global" : "Crear Prompt Global"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPrompt(null);
                  setFormData({ prompt_text: "", name: "", is_active: true });
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
                  Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Prompt para diagnósticos generales"
                  className="input-industrial w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-300 mb-2">
                  Prompt de IA *
                </label>
                <textarea
                  value={formData.prompt_text}
                  onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                  placeholder="Escribe las instrucciones para la IA..."
                  className="input-industrial w-full h-64 font-mono text-sm"
                  required
                />
                <p className="text-xs text-industrial-500 mt-1">
                  Mínimo 10 caracteres. Este prompt se aplicará a todos los talleres.
                </p>
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
                  Activar este prompt (desactivará otros prompts activos)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingPrompt ? handleUpdate : handleCreate}
                  disabled={formData.prompt_text.length < 10}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingPrompt ? "Actualizar" : "Crear"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPrompt(null);
                    setFormData({ prompt_text: "", name: "", is_active: true });
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

