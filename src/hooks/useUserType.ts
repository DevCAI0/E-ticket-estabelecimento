import { useMemo } from "react";
import { decryptData } from "@/lib/crypto";
import { showErrorToast } from "@/components/ui/sonner";

export interface UserPermissions {
  canCreateOrders: boolean;
  canViewOrders: boolean;
  canAddItems: boolean;
  canRemoveItems: boolean;
  canCancelOrders: boolean;
  canAcceptOrders: boolean;
  canRejectOrders: boolean;
  canMarkReady: boolean;
  canViewQRCode: boolean;
  canScanQRCode: boolean;
  canViewStatistics: boolean;
  canDeliverToEmployee: boolean;
}

export type UserType =
  | "estabelecimento"
  | "restaurante"
  | "admin"
  | "indefinido";

interface UserData {
  id: number;
  nome: string;
  login: string;
  id_estabelecimento?: number;
  id_restaurante?: number;
  id_perfil?: number;
  nome_estabelecimento?: string;
  nome_restaurante?: string;
  permissions?: {
    aceitar_pedido?: string;
    [key: string]: string | undefined;
  };
}

function obterUsuarioLogado(): UserData | null {
  try {
    const userStr =
      localStorage.getItem("encryptedUser") || localStorage.getItem("user");
    if (!userStr) return null;

    let userData: UserData;

    if (userStr.startsWith("{")) {
      userData = JSON.parse(userStr);
    } else {
      userData = decryptData(userStr);
    }

    return userData;
  } catch (_error) {
    showErrorToast("Erro ao obter dados do usuário");
    return null;
  }
}

function determinarTipoUsuario(userData: UserData): UserType {
  if (userData.id_restaurante) {
    return "restaurante";
  }

  if (userData.id_estabelecimento && !userData.id_restaurante) {
    return "estabelecimento";
  }

  if (userData.id_perfil === 1) {
    return "admin";
  }

  if (userData.permissions?.aceitar_pedido === "1") {
    return "restaurante";
  }

  return "indefinido";
}

function obterDescricaoTipo(userType: UserType): string {
  switch (userType) {
    case "estabelecimento":
      return "Usuário de Estabelecimento (Garagem)";
    case "restaurante":
      return "Usuário de Restaurante";
    case "admin":
      return "Administrador do Sistema";
    default:
      return "Tipo de usuário indefinido";
  }
}

export function useUserType() {
  const userData = obterUsuarioLogado();

  const userType: UserType = useMemo(() => {
    if (!userData) return "indefinido";
    return determinarTipoUsuario(userData);
  }, [userData]);

  const isEstabelecimento = userType === "estabelecimento";
  const isRestaurante = userType === "restaurante";
  const isAdmin = userType === "admin";

  const permissions: UserPermissions = useMemo(() => {
    if (!userData) {
      return {
        canCreateOrders: false,
        canViewOrders: false,
        canAddItems: false,
        canRemoveItems: false,
        canCancelOrders: false,
        canAcceptOrders: false,
        canRejectOrders: false,
        canMarkReady: false,
        canViewQRCode: false,
        canScanQRCode: false,
        canViewStatistics: false,
        canDeliverToEmployee: false,
      };
    }

    return {
      canCreateOrders: userType === "estabelecimento" || userType === "admin",
      canViewOrders: true,
      canAddItems: userType === "estabelecimento" || userType === "admin",
      canRemoveItems: userType === "estabelecimento" || userType === "admin",
      canCancelOrders: true,
      canAcceptOrders: userType === "restaurante" || userType === "admin",
      canRejectOrders: userType === "restaurante" || userType === "admin",
      canMarkReady: userType === "restaurante" || userType === "admin",
      canViewQRCode: userType === "estabelecimento" || userType === "admin",
      canScanQRCode: userType === "restaurante" || userType === "admin",
      canViewStatistics: true,
      canDeliverToEmployee:
        userType === "estabelecimento" || userType === "admin",
    };
  }, [userData, userType]);

  const userInfo = useMemo(() => {
    if (!userData) return null;

    return {
      id: userData.id,
      nome: userData.nome,
      login: userData.login,
      tipo: userType,
      tipo_descricao: obterDescricaoTipo(userType),
      id_estabelecimento: userData.id_estabelecimento || null,
      id_restaurante: userData.id_restaurante || null,
      estabelecimento: {
        id: userData.id_estabelecimento || null,
        nome: userData.nome_estabelecimento || null,
      },
      restaurante: {
        id: userData.id_restaurante || null,
        nome: userData.nome_restaurante || null,
      },
    };
  }, [userData, userType]);

  return {
    user: userData,
    userType,
    isEstabelecimento,
    isRestaurante,
    isAdmin,
    permissions,
    userInfo,
  };
}

export function useActionPermission() {
  const { permissions, userType } = useUserType();

  const canPerformAction = (action: keyof UserPermissions): boolean => {
    return permissions[action];
  };

  const getRestrictedMessage = (action: keyof UserPermissions): string => {
    const messages: Record<keyof UserPermissions, string> = {
      canCreateOrders: "Apenas estabelecimentos podem criar pedidos",
      canViewOrders: "Você não tem permissão para visualizar pedidos",
      canAddItems: "Apenas estabelecimentos podem adicionar itens",
      canRemoveItems: "Apenas estabelecimentos podem remover itens",
      canCancelOrders: "Você não tem permissão para cancelar pedidos",
      canAcceptOrders: "Apenas restaurantes podem aceitar pedidos",
      canRejectOrders: "Apenas restaurantes podem recusar pedidos",
      canMarkReady: "Apenas restaurantes podem marcar pedidos como prontos",
      canViewQRCode: "Apenas estabelecimentos podem visualizar QR Codes",
      canScanQRCode: "Apenas restaurantes podem escanear QR Codes",
      canViewStatistics: "Você não tem permissão para ver estatísticas",
      canDeliverToEmployee:
        "Apenas estabelecimentos podem entregar tickets aos funcionários",
    };

    return messages[action] || "Ação não permitida";
  };

  const getActionsByUserType = () => {
    const actions = {
      estabelecimento: [
        {
          key: "criar",
          label: "Criar Pedidos",
          enabled: permissions.canCreateOrders,
        },
        {
          key: "adicionar",
          label: "Adicionar Itens",
          enabled: permissions.canAddItems,
        },
        {
          key: "remover",
          label: "Remover Itens",
          enabled: permissions.canRemoveItems,
        },
        {
          key: "cancelar",
          label: "Cancelar Pedidos",
          enabled: permissions.canCancelOrders,
        },
        {
          key: "ver_qr",
          label: "Ver QR Code",
          enabled: permissions.canViewQRCode,
        },
        {
          key: "estatisticas",
          label: "Ver Estatísticas",
          enabled: permissions.canViewStatistics,
        },
        {
          key: "entregar_funcionario",
          label: "Entregar aos Funcionários",
          enabled: permissions.canDeliverToEmployee,
        },
      ],
      restaurante: [
        {
          key: "aceitar",
          label: "Aceitar Pedidos",
          enabled: permissions.canAcceptOrders,
        },
        {
          key: "recusar",
          label: "Recusar Pedidos",
          enabled: permissions.canRejectOrders,
        },
        {
          key: "pronto",
          label: "Marcar Pronto",
          enabled: permissions.canMarkReady,
        },
        {
          key: "escanear",
          label: "Escanear QR Code",
          enabled: permissions.canScanQRCode,
        },
        {
          key: "cancelar",
          label: "Cancelar Pedidos",
          enabled: permissions.canCancelOrders,
        },
        {
          key: "estatisticas",
          label: "Ver Estatísticas",
          enabled: permissions.canViewStatistics,
        },
      ],
      admin: [{ key: "todos", label: "Todas as Ações", enabled: true }],
      indefinido: [],
    };

    return actions[userType] || [];
  };

  return {
    canPerformAction,
    getRestrictedMessage,
    getActionsByUserType,
    permissions,
    userType,
  };
}
