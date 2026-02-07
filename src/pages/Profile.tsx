import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { authAPI, usersAPI } from "../services/api";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { notify } = useNotifications();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setName((prev) => (prev ? prev : (user?.name ?? "")));
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user) return "-";
    return user.role === 1 ? "Admin" : "User";
  }, [user]);

  if (!user) return null;

  const validateName = () => {
    const trimmed = name.trim();
    if (!trimmed) return "Enter a name";
    if (trimmed.length < 2) return "Name must be at least 2 characters";
    return null;
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);

    const error = validateName();
    if (error) {
      setNameError(error);
      return;
    }

    const nextName = name.trim();
    const currentName = (user.name ?? "").trim();
    if (nextName.toLowerCase() === currentName.toLowerCase()) {
      const message = "Name not changed. You cannot set the same name.";
      setNameError(message);
      notify(message, { type: "info" });
      return;
    }

    setNameLoading(true);
    try {
      await usersAPI.updateMyName({ name: nextName });
      await refreshUser();
      notify("Name updated", { type: "success" });
    } catch (err) {
      console.error("Failed to update name", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update name";
      setNameError(message);
      notify(message, { type: "error" });
    } finally {
      setNameLoading(false);
    }
  };

  const validatePassword = () => {
    if (!currentPassword.trim()) return "Enter current password";
    if (!newPassword.trim()) return "Enter new password";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
      return "New password must be at least 8 characters and include letters and numbers";
    }
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const error = validatePassword();
    if (error) {
      setPasswordError(error);
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify("Password changed", { type: "success" });
      navigate("/");
    } catch (err) {
      console.error("Failed to change password", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to change password";
      setPasswordError(message);
      notify(message, { type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
          </div>
          <div>
            <h1>Profile</h1>
            <p className="muted">Manage your personal data</p>
          </div>
        </div>

        <div className="profile-grid">
          <section className="profile-section">
            <h2>Information</h2>
            <div className="profile-info">
              <div>
                <span className="profile-label">Email</span>
                <span>{user.email ?? "-"}</span>
              </div>
              <div>
                <span className="profile-label">Role</span>
                <span>{roleLabel}</span>
              </div>
              <div>
                <span className="profile-label">Balance</span>
                <span>${(user.balance ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Change name</h2>
            <form className="profile-form" onSubmit={handleUpdateName}>
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </label>
              {nameError && <div className="field-error">{nameError}</div>}
              <button type="submit" className="primary" disabled={nameLoading}>
                {nameLoading ? "Updating..." : "Save"}
              </button>
            </form>
          </section>

          <section className="profile-section">
            <h2>Change password</h2>
            <form className="profile-form" onSubmit={handleChangePassword}>
              <label>
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              {passwordError && (
                <div className="field-error">{passwordError}</div>
              )}
              <button
                type="submit"
                className="primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
