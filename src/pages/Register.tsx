import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

type RegisterStep = "credentials" | "verify";

export function Register() {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<RegisterStep>("credentials");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canResend = step === "verify" && Boolean(email.trim());

  const isValidEmail = (() => {
    const v = email.trim();
    if (!v) return false;
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  })();

  if (isAuthenticated) {
    if (user?.role === UserRole.Admin) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setApiError(null);
    setMessage(null);
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextErrors: typeof fieldErrors = {};

    if (!trimmedName) {
      nextErrors.name = "Name is required";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }
    if (!isValidEmail) {
      nextErrors.email = "Please enter a valid email";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      nextErrors.password =
        "Password must be 8+ chars and include letters and numbers";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        confirmPassword,
      });
      setStep("verify");
      setMessage("We sent a 6-digit verification code to your email.");
    } catch (err) {
      console.error("Register failed", err);
      setApiError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setApiError(null);
    setMessage(null);
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (
      !trimmedCode ||
      trimmedCode.length !== 6 ||
      !/^\d{6}$/.test(trimmedCode)
    ) {
      setFieldErrors({ code: "Enter the 6-digit code" });
      return;
    }

    setLoading(true);
    try {
      await authAPI.completeRegistration({
        email: trimmedEmail,
        code: trimmedCode,
        password,
        confirmPassword,
        name: trimmedName,
      });

      const logged = await login({ email: trimmedEmail, password });
      if (logged?.role === UserRole.Admin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Verification failed", err);
      setApiError(
        "Verification failed. Check the code and try again. You can resend a new code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setApiError(null);
    setMessage(null);
    setLoading(true);
    try {
      await authAPI.resendVerificationCode({ email: email.trim() });
      setMessage("Verification code sent again.");
    } catch (err) {
      console.error("Resend failed", err);
      setApiError("Failed to resend verification code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Create account</h1>
        <p className="muted">
          {step === "credentials"
            ? "Enter email and password. We'll send a verification code."
            : "Enter the 6-digit code from your email to confirm."}
        </p>

        {step === "credentials" ? (
          <form className="login-form" onSubmit={handleSendCode}>
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              {fieldErrors.name && (
                <span className="field-error">{fieldErrors.name}</span>
              )}
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </label>
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              {fieldErrors.confirmPassword && (
                <span className="field-error">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </label>

            {message && <div className="success-banner">{message}</div>}
            {formError && <div className="field-error">{formError}</div>}
            {apiError && <div className="field-error">{apiError}</div>}

            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Sending..." : "Send verification code"}
            </button>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <Link
                to="/login"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleVerify}>
            <label>
              Name
              <input type="text" value={name} disabled />
            </label>
            <label>
              Email
              <input type="email" value={email} disabled />
            </label>
            <label>
              Verification code
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                placeholder="123456"
              />
              {fieldErrors.code && (
                <span className="field-error">{fieldErrors.code}</span>
              )}
            </label>

            {message && <div className="success-banner">{message}</div>}
            {formError && <div className="field-error">{formError}</div>}
            {apiError && <div className="field-error">{apiError}</div>}

            <button type="submit" className="primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify and sign in"}
            </button>

            {apiError && (
              <button
                type="button"
                className="secondary"
                onClick={handleResend}
                disabled={loading || !canResend}
                style={{ marginTop: 10, width: "100%" }}
              >
                Send verification code again
              </button>
            )}

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setStep("credentials");
                  setCode("");
                  setApiError(null);
                  setFormError(null);
                  setMessage(null);
                }}
              >
                ← Change email/password
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
