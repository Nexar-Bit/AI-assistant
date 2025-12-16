import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar/Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-industrial-950 text-industrial-100 overflow-hidden">
      {/* Sidebar Navigation - Desktop & Tablet */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Bar - Hidden on mobile */}
        <div className="hidden md:block">
          <TopBar />
        </div>
        
        {/* Primary Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}


