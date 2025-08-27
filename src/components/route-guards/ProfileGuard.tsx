// src/components/route-guards/ProfileGuard.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

interface ProfileGuardProps {
  children: React.ReactNode;
  allowedProfiles?: number[];
  redirectTo?: string;
  blockProfiles?: number[];
}

export function ProfileGuard({
  children,
  allowedProfiles = [],
  blockProfiles = [],
  redirectTo = "/pedidos",
}: ProfileGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (blockProfiles.length > 0 && blockProfiles.includes(user.id_perfil)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedProfiles.length > 0 && !allowedProfiles.includes(user.id_perfil)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
