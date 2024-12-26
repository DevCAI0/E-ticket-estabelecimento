// src/hooks/useMobileNav.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface UseMobileNavReturn {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export function useMobileNav(): UseMobileNavReturn {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Controla o scroll do body quando o menu está aberto
  useEffect(() => {
    if (isOpen) {
      // Bloqueia o scroll do body quando o menu está aberto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaura o scroll quando o menu é fechado
      document.body.style.overflow = 'unset';
    }

    // Cleanup: restaura o scroll quando o componente é desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fecha o menu quando a rota muda
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Fecha o menu quando pressiona ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Funções de controle do menu
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    toggle,
    close,
    open
  };
}