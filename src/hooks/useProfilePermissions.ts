// src/hooks/useProfilePermissions.ts - Hook para permissões de perfil
import { useAuth } from "@/hooks/auth/useAuth";
import { createProfilePermissions } from "@/utils/profileUtils";

export function useProfilePermissions() {
  const { user } = useAuth();
  return createProfilePermissions(user);
}
