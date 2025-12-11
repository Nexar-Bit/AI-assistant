import { useState, useEffect } from "react";
import { WorkshopCustomization } from "./WorkshopCustomization";
import { WorkshopSettings } from "./WorkshopSettings";
import { AIProvidersSettings } from "./AIProviders";
import { WorkshopPromptsSettings } from "./Prompts";
import { useWorkshopStore } from "../../stores/workshop.store";
import { usePermissions } from "../../hooks/usePermissions";
import { getWorkshop } from "../../api/workshops";
import { useNotification } from "../../components/layout/NotificationProvider";

export function SettingsPage() {
  const { currentWorkshop, setCurrentWorkshop } = useWorkshopStore();
  const { canAccess, isAdmin } = usePermissions();
  const { showCritical } = useNotification();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "customization" | "ai" | "prompts">("general");

  // Load fresh workshop data from database
  useEffect(() => {
    if (currentWorkshop) {
      loadWorkshopData();
    } else {
      setLoading(false);
    }
  }, [currentWorkshop?.id]);

  const loadWorkshopData = async () => {
    if (!currentWorkshop) return;

    setLoading(true);
    try {
      const workshop = await getWorkshop(currentWorkshop.id);
      setCurrentWorkshop(workshop);
    } catch (err: any) {
      console.error("Failed to load workshop data:", err);
      showCritical(err.response?.data?.detail || "Failed to load workshop data", "Error");
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkshop) {
    return (
      <div className="space-y-6 animate-fade-in p-6 h-full overflow-y-auto">
        <div>
          <h1 className="text-3xl font-bold text-industrial-100 mb-2">Configuración</h1>
          <p className="text-industrial-400">
            Configurar ajustes del taller y cuenta
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-industrial-400">Por favor selecciona un taller para ver la configuración.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-6 h-full overflow-y-auto">
        <div>
          <h1 className="text-3xl font-bold text-industrial-100 mb-2">Configuración</h1>
          <p className="text-industrial-400">
            Configurar ajustes del taller y cuenta
          </p>
        </div>
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-industrial-400">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold text-industrial-100 mb-2">Configuración</h1>
        <p className="text-industrial-400">
          Configurar ajustes del taller y cuenta
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-industrial-700">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "general"
                ? "text-primary-400 border-b-2 border-primary-400"
                : "text-industrial-400 hover:text-industrial-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("customization")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "customization"
                ? "text-primary-400 border-b-2 border-primary-400"
                : "text-industrial-400 hover:text-industrial-200"
            }`}
          >
            Personalización
          </button>
          {(canAccess.viewAIProviders || isAdmin) && (
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "ai"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Proveedores de IA
            </button>
          )}
          {canAccess.updateWorkshopSettings && (
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "prompts"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Prompts de IA
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "general" && <WorkshopSettings onUpdate={loadWorkshopData} />}
      {activeTab === "customization" && <WorkshopCustomization onUpdate={loadWorkshopData} />}
      {activeTab === "ai" && <AIProvidersSettings />}
      {activeTab === "prompts" && <WorkshopPromptsSettings />}
    </div>
  );
}

