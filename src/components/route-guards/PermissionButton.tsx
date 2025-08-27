import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { UserPermissions } from "@/hooks/useUserType";

interface PermissionButtonProps {
  children: ReactNode;
  requiredPermission: keyof UserPermissions;
  requiredUserType?: "estabelecimento" | "restaurante" | "admin";
  disabledTooltip?: string;
  hideWhenNoPermission?: boolean;
}

export function PermissionButton({
  children,
  requiredPermission,
  requiredUserType,
  disabledTooltip,
  hideWhenNoPermission = false,
  ...buttonProps
}: PermissionButtonProps & React.ComponentProps<typeof Button>) {
  const { checkPermission } = usePermissionCheck();

  const hasPermission = checkPermission(requiredPermission, requiredUserType);

  if (hideWhenNoPermission && !hasPermission) {
    return null;
  }

  return (
    <Button
      {...buttonProps}
      disabled={!hasPermission || buttonProps.disabled}
      title={!hasPermission ? disabledTooltip : buttonProps.title}
    >
      {children}
    </Button>
  );
}
