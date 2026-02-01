/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  authAPI,
  registerLogoutHandler,
  setAuthTokens,
  loadPersistedTokens,
} from "../services/api";
import { usersAPI } from "../services/api";
import type { LoginRequest, User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (payload: LoginRequest) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  topUpBalance: (amount: number) => Promise<User | null>;
  fakeTopUp: (amount: number) => User | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    registerLogoutHandler(() => {
      setUser(null);
      setAuthTokens(null);
      navigate("/login", { replace: true });
    });

    const tokens = loadPersistedTokens();
    if (!tokens) {
      setIsAuthLoading(false);
      return;
    }

    usersAPI
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        setAuthTokens(null);
        setUser(null);
      })
      .finally(() => setIsAuthLoading(false));
  }, [navigate]);

  const refreshUser = async () => {
    try {
      const res = await usersAPI.me();
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to refresh user", error);
      return null;
    }
  };

  const login = async (payload: LoginRequest) => {
    setIsAuthLoading(true);
    try {
      const res = await authAPI.login(payload);
      setAuthTokens(res.data);
      const me = await refreshUser();
      return me;
    } catch (error) {
      console.error("Login failed", error);
      setAuthTokens(null);
      setUser(null);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn("Logout call failed", error);
    } finally {
      setAuthTokens(null);
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  const topUpBalance = async (amount: number) => {
    if (!user) return null;

    const safeAmount = Math.max(0, amount);
    if (!safeAmount) return null;

    try {
      const res = await usersAPI.topUp(safeAmount);
      if (res?.data) {
        setUser(res.data);
      }
      const refreshed = await refreshUser();
      return refreshed ?? res?.data ?? user;
    } catch (error) {
      console.error("Failed to top up balance", error);
      return null;
    }
  };

  const fakeTopUp = (amount: number) => {
    if (!user) return null;
    const safeAmount = Math.max(0, amount);
    if (!safeAmount) return null;
    const updated: User = { ...user, balance: user.balance + safeAmount };
    setUser(updated);
    return updated;
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading,
    login,
    logout,
    refreshUser,
    topUpBalance,
    fakeTopUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
