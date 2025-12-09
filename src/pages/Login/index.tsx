import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginApi } from "../../api/auth";
import { useAuthStore } from "../../stores/auth.store";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi({ username, password });
      setTokens(res);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(t("auth.login.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">
                {t("auth.login.title")}
              </h1>
              <p className="text-xs text-industrial-400">Plataforma Profesional</p>
            </div>
          </div>
          <p className="mb-6 text-sm text-industrial-300">
            {t("auth.login.subtitle")}
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t("auth.login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <Input
              label={t("auth.login.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
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
                  {t("auth.login.signingIn")}
                </>
              ) : (
                t("auth.login.signIn")
              )}
            </Button>
            <div className="text-center text-sm text-industrial-400 mt-4">
              {t("auth.login.noAccount")}{" "}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
                {t("auth.login.signUp")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


