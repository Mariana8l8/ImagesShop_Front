import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { LoginRequest } from "../types";
import { UserRole } from "../types";

export function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    if (user?.role === UserRole.Admin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const nextErrors: typeof errors = {};
    const email = (form.email ?? "").trim();
    const password = form.password ?? "";

    if (!email) nextErrors.email = "Email is required";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      nextErrors.email = "Invalid email";
    }
    if (!password) nextErrors.password = "Password is required";
    if (password && password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const logged = await login(form);
      if (logged?.role === UserRole.Admin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error(error);
      setApiError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="muted">Use your email and password to continue.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="you@example.com"
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </label>
          {apiError && <div className="field-error">{apiError}</div>}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link
            to="/register"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Don&apos;t have an account? Join now
          </Link>
        </div>
      </div>
    </main>
  );
}
