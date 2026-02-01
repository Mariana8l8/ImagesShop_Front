import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: keyof typeof UserRole;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAuthLoading, user } = useAuth();

  if (isAuthLoading) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== UserRole[requiredRole]) {
    return <Navigate to="/" replace />;
  }

  return children;
}
