// src/components/route-guards/PermissionGuard.tsx
import { FC, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
}

export const PermissionGuard: FC<PermissionGuardProps> = ({
  children,
  permission,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug
  console.log("PermissionGuard Check:", {
    hasUser: !!user,
    groupId: user?.id_grupo_permissoes,
    requiredPermission: permission,
  });

  // Se não tiver usuário ou grupo de permissão
  if (!user?.id_grupo_permissoes) {
    navigate("/access-denied", {
      replace: true,
      state: { from: location.pathname },
    });
    return null;
  }

  // Admin tem acesso total
  if (user.id_grupo_permissoes === 1) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
