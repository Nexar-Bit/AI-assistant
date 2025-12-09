import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { WorkshopProvider } from "./providers/WorkshopProvider";
import { NotificationProvider } from "./components/layout/NotificationProvider";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { VerifyEmailPage } from "./pages/VerifyEmail";
import { DashboardPage } from "./pages/Dashboard";
import { ConsultationPage } from "./pages/Consultation";
import { HistoryPage } from "./pages/History";
import { AdminPage } from "./pages/Admin";
import { RegistrationManagement } from "./pages/Admin/RegistrationManagement";
import { WorkshopDetailView } from "./pages/Admin/WorkshopDetail";
import { ChatPage } from "./features/chat";
import { VehiclesPage } from "./pages/Vehicles";
import { TeamPage } from "./pages/Team";
import { SettingsPage } from "./pages/Settings";
import { ViewerDemo } from "./pages/RoleDemo/ViewerDemo";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
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
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Protected Routes with AppLayout */}
            <Route
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute requiredPermission="chat">
                    <ChatPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute requiredPermission="history">
                    <HistoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/registrations" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <RegistrationManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/workshops/:workshopId" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <WorkshopDetailView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vehicles" 
                element={
                  <ProtectedRoute requiredPermission="vehicles">
                    <VehiclesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/team" 
                element={
                  <ProtectedRoute requiredPermission="team">
                    <TeamPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requiredPermission="settings">
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/demo/viewer" 
                element={
                  <ProtectedRoute>
                    <ViewerDemo />
                  </ProtectedRoute>
                } 
              />
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
