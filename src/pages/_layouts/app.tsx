import { Outlet } from "react-router-dom";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { useAuth } from "@/hooks/auth/useAuth";
import { InstallPromptDialog } from "@/components/InstallPromptDialog";

export function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16 pt-14">
        <div className="mx-auto max-w-lg">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <InstallPromptDialog />
    </div>
  );
}
