import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmailApi, resendVerificationApi } from "../../api/auth";
import { useNotification } from "../../components/layout/NotificationProvider";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showCritical, showInfo } = useNotification();
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleVerifyEmail(token);
    } else {
      setVerificationStatus("error");
      setMessage("No verification token found.");
      showCritical("No verification token found.", "Error");
    }
  }, [searchParams]);

  const handleVerifyEmail = async (token: string) => {
    try {
      const res = await verifyEmailApi(token);
      setVerificationStatus("success");
      setMessage(res.message);
      showSuccess(res.message, "Email Verified");
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setVerificationStatus("error");
      const errorMessage = err.response?.data?.detail || "Email verification failed.";
      setMessage(errorMessage);
      showCritical(errorMessage, "Error");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      showCritical("Email address is required to resend verification.", "Error");
      return;
    }

    setResendingEmail(true);
    try {
      const res = await resendVerificationApi(email);
      showInfo(res.message, "Verification Email Sent");
    } catch (err: any) {
      console.error(err);
      showCritical(
        err.response?.data?.detail || "Failed to resend verification email",
        "Error"
      );
    } finally {
      setResendingEmail(false);
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
        <div className="card-hover gradient-border bg-slate-950/90 backdrop-blur-sm text-center p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              {verificationStatus === "loading" && (
                <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {verificationStatus === "success" && (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {verificationStatus === "error" && (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">
                Email Verification
              </h1>
              <p className="text-xs text-industrial-400">Vehicle Diagnostics AI</p>
            </div>
          </div>

          <p className={`mb-6 text-sm ${verificationStatus === "success" ? "text-success-400" : verificationStatus === "error" ? "text-red-400" : "text-industrial-300"}`}>
            {message || (verificationStatus === "loading" ? "Verifying your email address..." : "")}
          </p>

          {verificationStatus === "error" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-industrial-300 mb-2 text-left">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <button
                onClick={handleResendVerification}
                disabled={resendingEmail || !email}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendingEmail ? "Resending..." : "Resend Verification Email"}
              </button>
            </div>
          )}

          {verificationStatus !== "loading" && (
            <Link to="/login" className="block text-primary-400 hover:text-primary-300 text-sm mt-4">
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

