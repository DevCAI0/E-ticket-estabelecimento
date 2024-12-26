import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-background border-border hover:bg-accent hover:text-accent-foreground dark:bg-background dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-foreground dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-foreground dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-background border-border dark:bg-background dark:border-border"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}