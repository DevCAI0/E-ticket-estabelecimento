// components/pedidos/pedidos-actions.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, Plus, Search, X } from "lucide-react";
import { PEDIDO_STATUS_TEXTO } from "@/types/pedidos";

interface PedidosActionsProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onDateRangeChange?: (dateRange: { start?: string; end?: string }) => void;
  onCreateNew: () => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function PedidosActions({
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onCreateNew,
  onClearFilters,
  activeFiltersCount,
}: PedidosActionsProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onStatusChange(value);
  };

  const handleDateStartChange = (value: string) => {
    setDateStart(value);
    onDateRangeChange?.({ start: value, end: dateEnd });
  };

  const handleDateEndChange = (value: string) => {
    setDateEnd(value);
    onDateRangeChange?.({ start: dateStart, end: value });
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setDateStart("");
    setDateEnd("");
    onClearFilters();
  };

  const handleTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setDateStart(today);
    setDateEnd(today);
    setSelectedStatus("all");
    onDateRangeChange?.({ start: today, end: today });
  };

  return (
    <div className="space-y-4">
      {/* Barra de busca principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por código do pedido..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {/* Filtros rápidos */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Filtros de Pedidos</SheetTitle>
                <SheetDescription>
                  Configure os filtros para encontrar pedidos específicos
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status do Pedido</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {Object.entries(PEDIDO_STATUS_TEXTO).map(
                        ([status, texto]) => (
                          <SelectItem key={status} value={status}>
                            {texto}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="date-start">Data Inicial</Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={dateStart}
                      onChange={(e) => handleDateStartChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-end">Data Final</Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={dateEnd}
                      onChange={(e) => handleDateEndChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                  <Button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Filtros rápidos por status */}
          <Button
            variant={selectedStatus === "1" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("1")}
          >
            Pendentes
          </Button>

          <Button variant="outline" size="sm" onClick={handleTodayFilter}>
            Hoje
          </Button>
        </div>

        {/* Botão criar novo */}
        <Button onClick={onCreateNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      {/* Indicador de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between rounded-md bg-muted p-2">
          <span className="text-sm text-muted-foreground">
            {activeFiltersCount} filtro(s) ativo(s)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-auto p-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
