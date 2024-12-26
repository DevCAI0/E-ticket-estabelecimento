// src/components/navigation/bottom-nav.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Ticket,  Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Ticket,
      label: "Tickets",
      path: "/tickets",
    },
    {
      icon: Settings,
      label: "Ajustes",
      path: "/settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}