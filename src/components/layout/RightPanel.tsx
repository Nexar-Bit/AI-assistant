/** Right panel for vehicle details and token usage */

import React from "react";
import { useWorkshopStore } from "../../stores/workshop.store";
import { TokenUsageDisplay } from "../workshop/TokenUsageDisplay";
import { VehicleDetailsPanel } from "../vehicle/VehicleDetailsPanel";

interface RightPanelProps {
  children?: React.ReactNode;
  vehicleId?: string;
}

export function RightPanel({ children, vehicleId }: RightPanelProps) {
  const { currentWorkshop } = useWorkshopStore();

  return (
    <aside className="w-80 glass-strong border-l border-industrial-800 flex flex-col overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-industrial-800">
        <h2 className="text-sm font-semibold text-industrial-300 uppercase tracking-wider">
          Información
        </h2>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Token Usage */}
        {currentWorkshop && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-industrial-400 uppercase">
              Uso de tokens
            </h3>
            <TokenUsageDisplay workshopId={currentWorkshop.id} />
          </div>
        )}

        {/* Vehicle Details */}
        {vehicleId && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-industrial-400 uppercase">
              Detalles del vehículo
            </h3>
            <VehicleDetailsPanel vehicleId={vehicleId} />
          </div>
        )}

        {/* Custom Content */}
        {children}
      </div>
    </aside>
  );
}

