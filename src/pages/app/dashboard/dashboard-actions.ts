// src/config/dashboard-actions.ts
import {
  ScanLine,
  Search,
  CheckCircle,
  // FileText,
  // BarChart3,
  // CreditCard,
  // Package,
  // Truck,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface DashboardAction {
  icon: LucideIcon;
  title: string;
  color: string;
  path: string;
  description?: string;
}

export const dashboardActions: DashboardAction[] = [
  {
    icon: ScanLine,
    title: "Ler Tickets",
    color: "--chart-1",
    path: "/read-tickets",
    description: "Escaneie tickets via QR Code",
  },
  {
    icon: Search,
    title: "Manualmente",
    color: "--chart-2",
    path: "/manual-check",
    description: "Verificação manual de tickets",
  },
  {
    icon: CheckCircle,
    title: "Aprovar Tickets",
    color: "--chart-3",
    path: "/approve-tickets",
    description: "Aprovar tickets pendentes",
  },
];
