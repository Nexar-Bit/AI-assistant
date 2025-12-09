import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../stores/auth.store";
import { Button } from "../../common/Button";

export function Header() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.accessToken); // You can add user info to store later

  return (
    <header className="glass-strong border-b border-industrial-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient-primary">
              Diagnósticos de Vehículos IA
            </h1>
            <p className="text-xs text-industrial-400">Plataforma de Diagnóstico Profesional</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm">
            <div className="h-2 w-2 rounded-full bg-success-400 animate-pulse-slow"></div>
            <span className="text-industrial-300">{t("common.online")}</span>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}


