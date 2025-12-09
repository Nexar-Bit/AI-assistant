import React from "react";
import { Link } from "react-router-dom";
import { WorkshopDashboard } from "./WorkshopDashboard";
import { AutomotiveLayout } from "../../components/layout/AutomotiveLayout";

export function AdminPage() {
  return (
    <AutomotiveLayout showRightPanel={false}>
      <div className="space-y-6">
        {/* Quick Links */}
        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-100 mb-4">Administración</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/registrations"
              className="p-4 bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 rounded-lg transition-colors"
            >
              <h3 className="font-medium text-industrial-100 mb-1">Registros Pendientes</h3>
              <p className="text-xs text-industrial-400">Aprobar o rechazar nuevos usuarios</p>
            </Link>
            <div className="p-4 bg-industrial-800/50 border border-industrial-700 rounded-lg opacity-50">
              <h3 className="font-medium text-industrial-100 mb-1">Talleres</h3>
              <p className="text-xs text-industrial-400">Gestionar talleres y miembros</p>
            </div>
            <div className="p-4 bg-industrial-800/50 border border-industrial-700 rounded-lg opacity-50">
              <h3 className="font-medium text-industrial-100 mb-1">Reportes</h3>
              <p className="text-xs text-industrial-400">Estadísticas globales</p>
            </div>
          </div>
        </div>

        {/* Workshop Dashboard */}
        <WorkshopDashboard />
      </div>
    </AutomotiveLayout>
  );
}


