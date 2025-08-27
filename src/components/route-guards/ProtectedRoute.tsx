import { ReactNode } from "react";
import { useUserType, UserPermissions } from "@/hooks/useUserType";
import { PermissionGuard } from "./PermissionGuard";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: (keyof UserPermissions)[];
  requiredUserType?: "estabelecimento" | "restaurante" | "admin";
  fallbackRoute?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredUserType,
  fallbackRoute = "/dashboard",
}: ProtectedRouteProps) {
  const { permissions, userType } = useUserType();

  const hasAllPermissions = requiredPermissions.every(
    (permission) => permissions[permission],
  );

  const hasCorrectUserType = requiredUserType
    ? userType === requiredUserType
    : true;

  const hasAccess = hasAllPermissions && hasCorrectUserType;

  if (!hasAccess) {
    return (
      <PermissionGuard
        requiredPermission={requiredPermissions[0]}
        requiredUserType={requiredUserType}
        redirectTo={fallbackRoute}
      >
        {children}
      </PermissionGuard>
    );
  }

  return <>{children}</>;
}
