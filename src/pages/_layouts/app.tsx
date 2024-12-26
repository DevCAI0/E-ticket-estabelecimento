import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { useAuth } from "@/hooks/useAuth";
import { decryptData } from "@/lib/crypto";
import { InstallPromptDialog } from "@/components/InstallPromptDialog";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const isAuthenticated = () => {
    try {
      const encryptedToken = localStorage.getItem("encryptedToken");
      if (!encryptedToken) return false;

      const decryptedToken = decryptData(encryptedToken);
      return !!decryptedToken && decryptedToken.trim().length > 0;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const checkAuthentication = () => {
      if (isAuthenticated() && location.pathname === "/auth/login") {
        navigate("/", { replace: true });
        return;
      }

      if (!isAuthenticated() && location.pathname !== "/auth/login") {
        navigate("/auth/login", { replace: true });
      }
    };

    checkAuthentication();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "encryptedToken" && !isAuthenticated()) {
        navigate("/auth/sign-in", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, location.pathname]);

  // Loading state
  if (!user || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Impede renderização do layout em rotas de auth
  if (location.pathname === "/auth/sign-in" && isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 pb-16 pt-14">
        <div className="mx-auto max-w-lg">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <InstallPromptDialog />
    </div>
  );
}
