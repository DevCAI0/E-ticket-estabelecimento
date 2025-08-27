import { Profile } from "../profile";
import { ThemeToggle } from "../Theme/theme-toggle";

import eTicketLogo from "@/assets/Eticket.png";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b bg-background/95 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-background/40 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <img src={eTicketLogo} alt="eTicket Logo" className="w-6 h-12 mr-2" />
          <span className="pt-2 text-2xl font-bold text-foreground dark:text-foreground">
            Ticket
          </span>
        </div>

        <div className="flex items-center ml-auto space-x-2">
          <ThemeToggle />
          <Profile />
        </div>
      </div>
    </header>
  );
}
