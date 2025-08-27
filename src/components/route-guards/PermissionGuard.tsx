import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useUserType, UserPermissions } from "@/hooks/useUserType";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: keyof UserPermissions;
  requiredUserType?: "estabelecimento" | "restaurante" | "admin";
  fallback?: ReactNode;
  showAlert?: boolean;
  redirectTo?: string;
}

export function PermissionGuard({
  children,
  requiredPermission,
  requiredUserType,
  fallback,
  showAlert = true,
  redirectTo,
}: PermissionGuardProps) {
  const { userType, permissions, userInfo } = useUserType();
  const navigate = useNavigate();

  const hasPermission = requiredPermission
    ? permissions[requiredPermission]
    : true;

  const hasCorrectUserType = requiredUserType
    ? userType === requiredUserType
    : true;

  const hasAccess = hasPermission && hasCorrectUserType;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getErrorMessage = () => {
    if (!hasCorrectUserType && requiredUserType) {
      const typeNames = {
        estabelecimento: "usuários de estabelecimento",
        restaurante: "usuários de restaurante",
        admin: "administradores",
      };
      return `Esta funcionalidade está disponível apenas para ${typeNames[requiredUserType]}.`;
    }

    if (!hasPermission && requiredPermission) {
      const permissionMessages: Record<keyof UserPermissions, string> = {
        canCreateOrders: "criar pedidos",
        canViewOrders: "visualizar pedidos",
        canAddItems: "adicionar itens",
        canRemoveItems: "remover itens",
        canCancelOrders: "cancelar pedidos",
        canAcceptOrders: "aceitar pedidos",
        canRejectOrders: "recusar pedidos",
        canMarkReady: "marcar como pronto",
        canViewQRCode: "visualizar código QR",
        canScanQRCode: "escanear código QR",
        canViewStatistics: "ver estatísticas",
        canDeliverToEmployee: "entregar aos funcionários",
      };

      const actionName =
        permissionMessages[requiredPermission] || "executar esta ação";
      return `Você não tem permissão para ${actionName}.`;
    }

    return "Você não tem permissão para acessar esta funcionalidade.";
  };

  const handleGoBack = () => {
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {showAlert && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorMessage()}</AlertDescription>
            </Alert>
          )}

          {userInfo && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">Informações da sua conta:</p>
              <p className="text-muted-foreground">
                <strong>Nome:</strong> {userInfo.nome}
              </p>
              <p className="text-muted-foreground">
                <strong>Login:</strong> {userInfo.login}
              </p>
              <p className="text-muted-foreground">
                <strong>Perfil:</strong> {userInfo.tipo_descricao}
              </p>
              <p className="text-muted-foreground">
                <strong>Tipo:</strong>{" "}
                {userType === "estabelecimento"
                  ? "Estabelecimento"
                  : userType === "restaurante"
                    ? "Restaurante"
                    : userType === "admin"
                      ? "Administrador"
                      : "Indefinido"}
              </p>
              {userType === "estabelecimento" && (
                <p className="text-muted-foreground">
                  <strong>Estabelecimento ID:</strong>{" "}
                  {userInfo.id_estabelecimento}
                </p>
              )}
              {userType === "restaurante" && userInfo.id_restaurante && (
                <p className="text-muted-foreground">
                  <strong>Restaurante ID:</strong> {userInfo.id_restaurante}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Se você acredita que deveria ter acesso a esta funcionalidade, entre
            em contato com o administrador do sistema.
          </p>

          <Button onClick={handleGoBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
