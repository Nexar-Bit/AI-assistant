/** Main automotive-themed layout component for chat interface */

import React from "react";
import { RightPanel } from "./RightPanel";

interface AutomotiveLayoutProps {
  children: React.ReactNode;
  showRightPanel?: boolean;
  rightPanelContent?: React.ReactNode;
}

export function AutomotiveLayout({
  children,
  showRightPanel = true,
  rightPanelContent,
}: AutomotiveLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden bg-industrial-950">
      {/* Center: Chat Interface (Primary Workspace) */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-industrial-950 min-w-0">
        {children}
      </main>

      {/* Right Panel: Vehicle Details / Token Usage - Desktop only */}
      {showRightPanel && (
        <div className="hidden xl:block w-80 flex-shrink-0">
          <RightPanel>{rightPanelContent}</RightPanel>
        </div>
      )}
    </div>
  );
}

