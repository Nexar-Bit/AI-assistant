/** Main chat page component using new feature structure */

import React, { useState } from "react";
import { AutomotiveLayout } from "../../components/layout/AutomotiveLayout";
import { ChatProvider, useChatContext } from "./context/ChatProvider";
import { SessionSidebar } from "./sessions/SessionSidebar";
import { ChatWindow } from "./ChatWindow";
import { ContextPanel } from "../../components/chat/ContextPanel";
import { UsageDashboard } from "../tokens/UsageDashboard";
import { VehicleQuickEntry } from "../../components/vehicles/VehicleQuickEntry";
import { ExpandableVehicleDetailsPanel } from "../../components/layout/VehicleDetailsPanel";
import { useWorkshopStore } from "../../stores/workshop.store";
import { useNotification } from "../../components/layout/NotificationProvider";
import type { ChatThread } from "../../types/chat.types";
import type { Vehicle } from "../../types/vehicle.types";

function ChatPageContent() {
  const { currentThread, setCurrentThread, createSession } = useChatContext();
  const { currentWorkshop } = useWorkshopStore();
  const { showCritical, showWarning } = useNotification();
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [errorCodes, setErrorCodes] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // Listen for new chat requests from mobile FAB
  React.useEffect(() => {
    const handleNewChatRequest = () => {
      setShowNewSessionForm(true);
    };

    window.addEventListener("new-chat-request", handleNewChatRequest);
    return () => {
      window.removeEventListener("new-chat-request", handleNewChatRequest);
    };
  }, []);

  // Handle mobile sidebar visibility
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setShowSidebar(!isMobile || !currentThread);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentThread]);

  const handleVehicleSelect = async (vehicle: Vehicle) => {
    // Check if workshop is selected before creating session
    if (!currentWorkshop) {
      showCritical(
        "No workshop selected. Please select a workshop from the top menu before creating a session.",
        "Workshop Required"
      );
      return;
    }

    try {
      const vehicleContext = [
        vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : null,
        vehicle.year ? `(${vehicle.year})` : null,
        vehicle.engine_type ? `Engine: ${vehicle.engine_type}` : null,
        vehicle.fuel_type ? `Fuel: ${vehicle.fuel_type}` : null,
      ]
        .filter(Boolean)
        .join(" ");

      const thread = await createSession({
        license_plate: vehicle.license_plate,
        vehicle_id: vehicle.id,
        vehicle_km: vehicle.current_km,
        vehicle_context: vehicleContext || undefined,
        error_codes: errorCodes.length > 0 ? errorCodes.join(", ") : undefined,
      });

      setShowNewSessionForm(false);
      setErrorCodes([]);
    } catch (err: any) {
      console.error("Failed to create session:", err);
      const errorMessage = err.message || err.response?.data?.detail || "Failed to create session";
      showCritical(errorMessage, "Session Creation Failed");
    }
  };

  return (
    <AutomotiveLayout
      showRightPanel={false}
    >
      <div className="flex h-full flex-col">
        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col md:flex-row min-h-0">
          {/* Session Sidebar - Hidden on mobile when thread is selected */}
          {showSidebar && (
            <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-industrial-800">
              <SessionSidebar
                onSelectSession={(thread) => {
                  setCurrentThread(thread);
                  // On mobile, hide sidebar when thread is selected
                  if (window.innerWidth < 768) {
                    setShowSidebar(false);
                  }
                }}
                onCreateSession={() => setShowNewSessionForm(true)}
                selectedSessionId={currentThread?.id}
              />
            </div>
          )}

          {/* Chat Window - Full screen on mobile, larger on desktop */}
          <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
            {/* Mobile back button */}
            {currentThread && (
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden absolute top-4 left-4 z-10 p-2 bg-industrial-800/90 rounded-lg border border-industrial-700 text-industrial-200 hover:bg-industrial-700 transition-colors"
                aria-label="Back to sessions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <ChatWindow 
              thread={currentThread} 
              onCreateSession={() => setShowNewSessionForm(true)}
            />
          </div>
        </div>

        {/* Expandable Vehicle Details Panel at Bottom */}
        {currentThread && (
          <ExpandableVehicleDetailsPanel
            vehicleId={currentThread.vehicle_id}
            vehicleData={{
              license_plate: currentThread.license_plate,
              current_km: currentThread.vehicle_km,
              error_codes: currentThread.error_codes
                ? currentThread.error_codes.split(",").map((c) => c.trim())
                : undefined,
            }}
          />
        )}
      </div>

      {/* New Session Modal with Vehicle Quick Entry */}
      {showNewSessionForm && (
        <div className="fixed inset-0 bg-industrial-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <VehicleQuickEntry
              onSelect={handleVehicleSelect}
              onCancel={() => {
                setShowNewSessionForm(false);
                setErrorCodes([]);
              }}
            />
          </div>
        </div>
      )}
    </AutomotiveLayout>
  );
}

export function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}

