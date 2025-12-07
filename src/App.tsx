import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { WorkshopProvider } from "./providers/WorkshopProvider";
import { NotificationProvider } from "./components/layout/NotificationProvider";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { DashboardPage } from "./pages/Dashboard";
import { ConsultationPage } from "./pages/Consultation";
import { HistoryPage } from "./pages/History";
import { AdminPage } from "./pages/Admin";
import { ChatPage } from "./features/chat";
import { VehiclesPage } from "./pages/Vehicles";
import { TeamPage } from "./pages/Team";
import { SettingsPage } from "./pages/Settings";
import { useAuthStore } from "./stores/auth.store";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  // Load tokens from storage on mount
  useAuthStore.getState().loadTokensFromStorage();

  return (
    <AuthProvider>
      <WorkshopProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<SignupPage />} />
            
            {/* Protected Routes with AppLayout */}
            <Route
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </WorkshopProvider>
    </AuthProvider>
  );
}

export default App;
