import { useState, useEffect } from "react";
import { useWorkshopStore } from "../../stores/workshop.store";
import { useNotification } from "../../components/layout/NotificationProvider";
import { getWorkshopPrompt, updateWorkshopPrompt } from "../../api/prompts";

export function WorkshopPromptsSettings() {
  const { currentWorkshop } = useWorkshopStore();
  const { showSuccess, showCritical } = useNotification();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentWorkshop) {
      loadPrompt();
    } else {
      setLoading(false);
    }
  }, [currentWorkshop?.id]);

  const loadPrompt = async () => {
    if (!currentWorkshop) return;

    setLoading(true);
    try {
      const workshopPrompt = await getWorkshopPrompt(currentWorkshop.id);
      setPrompt(workshopPrompt || "");
    } catch (err: any) {
      console.error("Failed to load prompt:", err);
      showCritical(err.response?.data?.detail || "No se pudo cargar el prompt", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentWorkshop) return;

    setSaving(true);
    try {
      await updateWorkshopPrompt(currentWorkshop.id, prompt);
      showSuccess("Prompt del taller actualizado exitosamente", "Éxito");
    } catch (err: any) {
      console.error("Failed to save prompt:", err);
      showCritical(err.response?.data?.detail || "No se pudo guardar el prompt", "Error");
    } finally {
      setSaving(false);
    }
  };

  if (!currentWorkshop) {
    return (
      <div className="card text-center py-12">
        <p className="text-industrial-400">Por favor selecciona un taller.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-industrial-400">Cargando prompt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-industrial-100 mb-2">Prompt de IA del Taller</h2>
        <p className="text-sm text-industrial-400">
          Configura instrucciones específicas para la IA en este taller. Estas instrucciones se combinarán con el prompt global.
          Los técnicos no pueden ver este prompt.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-industrial-300 mb-2">
          Instrucciones del Taller
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ejemplo: Este taller se especializa en vehículos europeos. Siempre proporciona recomendaciones de repuestos originales cuando sea posible..."
          className="input-industrial w-full h-64 font-mono text-sm"
        />
        <p className="text-xs text-industrial-500 mt-1">
          Mínimo 10 caracteres. Este prompt se combinará con el prompt global configurado por el administrador de plataforma.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || prompt.length < 10}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Guardando..." : "Guardar Prompt"}
        </button>
        <button
          onClick={() => setPrompt("")}
          disabled={saving}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}

