import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketActionsProps {
  onSearchChange: (value: string) => void;
  onMealTypeChange: (value: string) => void;
}

export function TicketActions({
  onSearchChange,
  onMealTypeChange,
}: TicketActionsProps) {
  return (
    <div className="rounded-lg bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número do ticket ou nome"
            className="pl-9"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select onValueChange={onMealTypeChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo de refeição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Almoço">Almoço</SelectItem>
            <SelectItem value="Jantar">Jantar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
