import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Calendar02 from "../calendar-02";
import { Search, Calendar as CalendarIcon, Home, X } from "lucide-react";
import { obterNomeMes } from "@/services/notasRestauranteService";

interface NotasActionsProps {
  mes: number;
  ano: number;
  isMesAtual: boolean;
  onPeriodoChange: (novoMes: number, novoAno: number) => void;
  onVoltarMesAtual: () => void;
}

export function NotasActions({
  mes,
  ano,
  isMesAtual,
  onPeriodoChange,
  onVoltarMesAtual,
}: NotasActionsProps) {
  const [dataCalendar, setDataCalendar] = React.useState<Date | undefined>(
    new Date(ano, mes - 1, 1),
  );
  const [termoBusca, setTermoBusca] = React.useState("");

  React.useEffect(() => {
    setDataCalendar(new Date(ano, mes - 1, 1));
  }, [mes, ano]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const novoMes = date.getMonth() + 1;
      const novoAno = date.getFullYear();
      onPeriodoChange(novoMes, novoAno);
      setDataCalendar(date);
    }
  };

  const limparBusca = () => {
    setTermoBusca("");
  };

  const handleBusca = (termo: string) => {
    setTermoBusca(termo);
  };

  return (
    <div>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Buscar notas por nome, valor, etc..."
                value={termoBusca}
                onChange={(e) => handleBusca(e.target.value)}
                className="pl-10 pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                  }
                }}
              />
              {termoBusca && (
                <button
                  onClick={limparBusca}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform rounded p-1 hover:bg-muted"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isMesAtual && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onVoltarMesAtual}
                  className="flex items-center gap-1 text-sm"
                >
                  <Home className="h-3 w-3" />
                  Atual
                </Button>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {obterNomeMes(mes)} {ano}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar02
                    selected={dataCalendar}
                    onSelect={handleCalendarSelect}
                    initialFocus
                    defaultMonth={dataCalendar}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
