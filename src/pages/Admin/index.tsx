import React, { useState } from "react";
import { Link } from "react-router-dom";
import { WorkshopDashboard } from "./WorkshopDashboard";
import { GlobalPromptsManagement } from "./GlobalPrompts";
import { UsersManagement } from "./UsersManagement";
import { WorkshopsManagement } from "./WorkshopsManagement";
import { AutomotiveLayout } from "../../components/layout/AutomotiveLayout";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "prompts" | "users" | "workshops">("dashboard");

  return (
    <AutomotiveLayout showRightPanel={false}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-industrial-100 mb-2">Administración de Plataforma</h1>
          <p className="text-industrial-400">
            Gestiona talleres, usuarios, prompts globales y configuración del sistema
          </p>
        </div>

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
              Talleres
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("workshops")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "workshops"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Gestión Talleres
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "prompts"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-industrial-400 hover:text-industrial-200"
              }`}
            >
              Prompts Globales
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <>
            {/* Quick Links */}
            <div className="card">
              <h2 className="text-lg font-semibold text-industrial-100 mb-4">Accesos Rápidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin/registrations"
                  className="p-4 bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 rounded-lg transition-colors"
                >
                  <h3 className="font-medium text-industrial-100 mb-1">Registros Pendientes</h3>
                  <p className="text-xs text-industrial-400">Aprobar o rechazar nuevos usuarios</p>
                </Link>
                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 rounded-lg transition-colors text-left"
                >
                  <h3 className="font-medium text-industrial-100 mb-1">Gestión de Usuarios</h3>
                  <p className="text-xs text-industrial-400">Crear, editar y eliminar usuarios</p>
                </button>
                <button
                  onClick={() => setActiveTab("workshops")}
                  className="p-4 bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 rounded-lg transition-colors text-left"
                >
                  <h3 className="font-medium text-industrial-100 mb-1">Gestión de Talleres</h3>
                  <p className="text-xs text-industrial-400">Bloquear, desbloquear y configurar</p>
                </button>
              </div>
            </div>

            {/* Workshop Dashboard */}
            <WorkshopDashboard />
          </>
        )}
        {activeTab === "users" && <UsersManagement />}
        {activeTab === "workshops" && <WorkshopsManagement />}
        {activeTab === "prompts" && <GlobalPromptsManagement />}
      </div>
    </AutomotiveLayout>
  );
}


