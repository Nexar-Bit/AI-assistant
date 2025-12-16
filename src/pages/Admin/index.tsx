import React, { useState } from "react";
import { PlatformAdminDashboard } from "./PlatformAdminDashboard";
import { GlobalPromptsManagement } from "./GlobalPrompts";
import { UsersManagement } from "./UsersManagement";
import { WorkshopsManagement } from "./WorkshopsManagement";
import { RegistrationManagement } from "./RegistrationManagement";
import { AutomotiveLayout } from "../../components/layout/AutomotiveLayout";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "registrations" | "prompts" | "users" | "workshops">("dashboard");

  const handleTabChange = (tab: "dashboard" | "registrations" | "prompts" | "users" | "workshops") => {
    setActiveTab(tab);
  };

  return (
    <AutomotiveLayout showRightPanel={false}>
      <div className="space-y-6 p-6">
        {/* Tabs */}
        <div className="border-b border-industrial-700">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Dashboard Principal
            </button>
            <button
              onClick={() => setActiveTab("registrations")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "registrations"
                  ? "text-warning-400 border-b-2 border-warning-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              ⏰ Registros Pendientes
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Todos los Usuarios
            </button>
            <button
              onClick={() => setActiveTab("workshops")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "workshops"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Gestión Avanzada Talleres
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "prompts"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              ⚙️ Prompts Globales de IA
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <PlatformAdminDashboard onTabChange={handleTabChange} />}
        {activeTab === "registrations" && <RegistrationManagement />}
        {activeTab === "users" && <UsersManagement />}
        {activeTab === "workshops" && <WorkshopsManagement />}
        {activeTab === "prompts" && <GlobalPromptsManagement />}
      </div>
    </AutomotiveLayout>
  );
}


