import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { showErrorToast } from "@/components/ui/sonner";

export function Profile() {
  const { user, logout } = useAuth();

  const getInitial = () => {
    if (!user?.nome) return "U";
    const names = user.nome.trim().split(" ");
    return names[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      showErrorToast("Erro ao fazer logout");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full hover:bg-accent"
          aria-label="Menu do usuário"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col space-y-1">
              <p className="line-clamp-1 text-sm font-medium">{user.nome}</p>
              <p className="text-xs text-muted-foreground">{user.login}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
