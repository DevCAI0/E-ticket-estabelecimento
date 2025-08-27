import { useUserType, UserPermissions } from "@/hooks/useUserType";

export function usePermissionCheck() {
  const { permissions, userType } = useUserType();

  const checkPermission = (
    requiredPermission: keyof UserPermissions,
    requiredUserType?: "estabelecimento" | "restaurante" | "admin",
  ): boolean => {
    const hasPermission = permissions[requiredPermission];
    const hasCorrectUserType = requiredUserType
      ? userType === requiredUserType
      : true;

    return hasPermission && hasCorrectUserType;
  };

  const requirePermission = (
    requiredPermission: keyof UserPermissions,
    requiredUserType?: "estabelecimento" | "restaurante" | "admin",
  ): void => {
    if (!checkPermission(requiredPermission, requiredUserType)) {
      throw new Error("Permissão insuficiente");
    }
  };

  return {
    checkPermission,
    requirePermission,
    permissions,
    userType,
  };
}
