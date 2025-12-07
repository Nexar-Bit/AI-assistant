import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerApi, verifyEmailApi, resendVerificationApi } from "../../api/auth";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useNotification } from "../../components/layout/NotificationProvider";

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showCritical, showInfo } = useNotification();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    searchParams.get("token")
  );
  const [verifying, setVerifying] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Handle email verification if token is in URL
  useEffect(() => {
    if (verificationToken) {
      handleVerifyEmail(verificationToken);
    }
  }, [verificationToken]);

  const handleVerifyEmail = async (token: string) => {
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyEmailApi(token);
      showSuccess(result.message, "Email Verified");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "Failed to verify email";
      setError(errorMessage);
      showCritical(errorMessage, "Verification Failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    setLoading(true);
    setError(null);
    try {
      await resendVerificationApi(registeredEmail);
      showSuccess("Verification email sent. Please check your inbox.", "Email Sent");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "Failed to resend verification email";
      setError(errorMessage);
      showCritical(errorMessage, "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 12) {
      setError("Password must be at least 12 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await registerApi({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      setRegistered(true);
      setRegisteredEmail(formData.email);
      showSuccess(result.message, "Registration Successful");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "Registration failed";
      setError(errorMessage);
      showCritical(errorMessage, "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  // Show verification page if token is present
  if (verificationToken && verifying) {
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
          <div className="card-hover gradient-border bg-slate-950/90 backdrop-blur-sm text-center">
            <div className="mb-6">
              <div className="h-16 w-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-industrial-100">Verifying Email...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="h-16 w-16 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-industrial-100 mb-2">Registration Successful!</h2>
              <p className="text-sm text-industrial-400">
                We've sent a verification link to <strong>{registeredEmail}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-primary-500/10 border border-primary-500/20 px-4 py-3 text-sm text-primary-300">
                Please check your email and click the verification link to activate your account.
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="flex-1"
                  variant="secondary"
                >
                  {loading ? "Sending..." : "Resend Email"}
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  className="flex-1"
                >
                  Go to Login
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
                Create Account
              </h1>
              <p className="text-xs text-industrial-400">Join Vehicle Diagnostics AI</p>
            </div>
          </div>
          <p className="mb-6 text-sm text-industrial-300">
            Sign up to start using the diagnostics platform
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_-]+"
              title="Username can only contain letters, numbers, underscores, and hyphens"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="new-password"
              required
              minLength={12}
            />
            <div className="text-xs text-industrial-500">
              Password must be at least 12 characters with uppercase, lowercase, digit, and special character
            </div>
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              autoComplete="new-password"
              required
              minLength={12}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <div className="text-center text-sm text-industrial-400">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

