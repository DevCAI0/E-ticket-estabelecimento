// src/hooks/usePageVisibility.ts
import { useState, useEffect, useRef } from "react";

export interface UsePageVisibilityOptions {
  onVisible?: () => void;
  onHidden?: () => void;
  debounceMs?: number;
}

/**
 * Hook para detectar quando a página fica visível/invisível
 * Útil para verificar atualizações quando o usuário volta para a aba
 */
export function usePageVisibility(options: UsePageVisibilityOptions = {}) {
  const { onVisible, onHidden, debounceMs = 1000 } = options;
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastVisibilityChangeRef = useRef<number>(Date.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const isCurrentlyVisible = !document.hidden;

      // Debounce para evitar múltiplas chamadas rápidas
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        // Verificar se mudou de fato e se passou tempo suficiente desde a última mudança
        if (
          isCurrentlyVisible !== isVisible &&
          now - lastVisibilityChangeRef.current > debounceMs
        ) {
          setIsVisible(isCurrentlyVisible);
          lastVisibilityChangeRef.current = now;

          if (isCurrentlyVisible && onVisible) {
            onVisible();
          } else if (!isCurrentlyVisible && onHidden) {
            onHidden();
          }
        }
      }, debounceMs);
    };

    // Listener para mudança de visibilidade
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listener para foco da janela (fallback)
    const handleFocus = () => {
      if (!isVisible) {
        handleVisibilityChange();
      }
    };

    const handleBlur = () => {
      if (isVisible) {
        handleVisibilityChange();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isVisible, onVisible, onHidden, debounceMs]);

  return {
    isVisible,
    isHidden: !isVisible,
  };
}
