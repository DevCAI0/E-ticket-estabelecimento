import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { DateRange } from "react-day-picker";
import BackButton from '@/components/BackButton';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dados de faturamento inicial
const initialFaturamentoData = [
  { mes: "Janeiro", receita: 15000 },
  { mes: "Fevereiro", receita: 18000 },
  { mes: "Março", receita: 17000 },
  { mes: "Abril", receita: 20000 },
  { mes: "Maio", receita: 22000 },
  { mes: "Junho", receita: 25000 },
];

export function FaturamentoEstabelecimento() {
  const [chartWidth, setChartWidth] = useState(window.innerWidth < 640 ? window.innerWidth - 40 : 500);
  const [faturamentoData, setFaturamentoData] = useState(initialFaturamentoData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const updateChartSize = () => {
      setChartWidth(window.innerWidth < 640 ? window.innerWidth - 40 : 500);
    };

    window.addEventListener("resize", updateChartSize);
    updateChartSize();

    return () => window.removeEventListener("resize", updateChartSize);
  }, []);

  // Filtra o faturamento com base no intervalo de datas selecionado
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const from = dateRange.from;
      const to = dateRange.to;

      const filteredData = initialFaturamentoData.filter((data) => {
        const mesIndex = new Date(`2024-${data.mes}-01`).getMonth();
        const currentDate = new Date(2024, mesIndex, 1);
        return currentDate >= from && currentDate <= to;
      });

      setFaturamentoData(filteredData);
    } else {
      setFaturamentoData(initialFaturamentoData);
    }
  }, [dateRange]);

  // Calcula o total de faturamento acumulado
  const totalFaturamento = faturamentoData.reduce((total, item) => total + item.receita, 0);

  // Calcula a variação de crescimento entre o último mês e o mês anterior
  const crescimento = (
    ((faturamentoData[faturamentoData.length - 1]?.receita -
      faturamentoData[faturamentoData.length - 2]?.receita) /
      faturamentoData[faturamentoData.length - 2]?.receita) *
    100
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <BackButton />
          <CardTitle className="ml-2 text-3xl">Faturamento</CardTitle>
        </div>
        <CardDescription>Filtre por período de datas</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Componente de seleção de período */}
        <DatePickerWithRange
          className="w-full"
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        {/* Gráfico de faturamento */}
        <div className="flex justify-center">
          <BarChart width={chartWidth} height={250} data={faturamentoData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <Tooltip />
            <Legend />
            <Bar dataKey="receita" fill="#4caf50" radius={4} />
          </BarChart>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {Number(crescimento) > 0 ? (
            <>
              Crescimento de {crescimento.toFixed(1)}% este mês <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Queda de {Math.abs(Number(crescimento)).toFixed(1)}% este mês <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div>
        <div className="text-muted-foreground">
          Faturamento acumulado: R$ {totalFaturamento.toLocaleString("pt-BR")}
        </div>
      </CardFooter>
    </Card>
  );
}
