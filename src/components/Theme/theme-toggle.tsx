import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-background dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 text-foreground transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 text-foreground transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border bg-background dark:border-border dark:bg-background"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
