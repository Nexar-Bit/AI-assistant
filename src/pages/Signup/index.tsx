import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useNotification } from "../../components/layout/NotificationProvider";

export function SignupPage() {
  const navigate = useNavigate();
  const { showSuccess, showCritical, showInfo } = useNotification();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    registration_message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.password.length < 12) {
      setError("La contraseña debe tener al menos 12 caracteres");
      setLoading(false);
      return;
    }

    try {
      const result = await registerApi({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        registration_message: formData.registration_message || undefined,
      });
      
      setRegistered(true);
      setRegisteredEmail(formData.email);
      showSuccess(result.message, "Registro exitoso");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "No se pudo completar el registro";
      setError(errorMessage);
      showCritical(errorMessage, "Registro fallido");
    } finally {
      setLoading(false);
    }
  };

  // Show success message after registration
  if (registered) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        style={{
          backgroundImage: "url('/Back.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-md animate-fade-in">
          <div className="card-hover gradient-border bg-slate-950/90 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-warning-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-industrial-100 mb-2">¡Solicitud Enviada!</h2>
              <p className="text-sm text-industrial-400">
                Tu cuenta ha sido registrada: <strong className="text-industrial-200">{registeredEmail}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-warning-500/10 border border-warning-500/30 px-4 py-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-warning-300 mb-1">Esperando Aprobación del Administrador</h3>
                    <p className="text-sm text-warning-400/80">
                      Tu solicitud de registro está pendiente de revisión. Un administrador de la plataforma revisará tu información y te asignará a un taller.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-primary-500/10 border border-primary-500/20 px-4 py-3">
                <p className="text-xs text-primary-300 mb-2">🛡️ <strong>Tu cuenta está pendiente de aprobación</strong></p>
                <p className="text-xs text-primary-400">
                  Un administrador revisará tu solicitud y, cuando la apruebe, podrás iniciar sesión en el sistema.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/login")}
                  className="flex-1"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: "url('/Back.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <div className="card-hover gradient-border bg-slate-950/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">
                Crear cuenta
              </h1>
              <p className="text-xs text-industrial-400">Únete a Diagnósticos de Vehículos IA</p>
            </div>
          </div>
          <p className="mb-6 text-sm text-industrial-300">
            Regístrate para comenzar a usar la plataforma de diagnósticos de vehículos.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_\-]+"
              title="El nombre de usuario solo puede contener letras, números, guiones bajos y guiones"
            />
            <Input
              label="Correo electrónico"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="new-password"
              required
              minLength={12}
            />
            <div className="text-xs text-industrial-500">
              La contraseña debe tener al menos 12 caracteres con mayúsculas, minúsculas, dígitos y caracteres especiales
            </div>
            <Input
              label="Confirmar contraseña"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              autoComplete="new-password"
              required
              minLength={12}
            />
            
            <div>
              <label className="block text-sm font-medium text-industrial-300 mb-2">
                Mensaje para administradores (Opcional)
              </label>
              <textarea
                name="registration_message"
                value={formData.registration_message}
                onChange={(e) =>
                  setFormData({ ...formData, registration_message: e.target.value })
                }
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                placeholder="Cuéntanos sobre ti o tu taller..."
              />
              <p className="text-xs text-industrial-500 mt-1">
                {formData.registration_message.length}/500
              </p>
            </div>
            
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 animate-slide-up">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                <>Crear cuenta</>
              )}
            </Button>
            <div className="text-center text-sm text-industrial-400">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

