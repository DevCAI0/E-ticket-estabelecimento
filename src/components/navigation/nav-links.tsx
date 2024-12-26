// src/components/navigation/nav-links.tsx
import { Link } from "react-router-dom";
import { LayoutGrid, Ticket, Receipt } from "lucide-react";

interface NavLinksProps {
  onItemClick?: () => void;
}

export function NavLinks({ onItemClick }: NavLinksProps) {
  const menuItems = [
    {
      icon: LayoutGrid,
      label: "Home",
      path: "/",
    },
    {
      icon: Ticket,
      label: "Meus Tickets",
      path: "/tickets",
    },
    {
      icon: Receipt,
      label: "Histórico",
      path: "/history",
    },
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}