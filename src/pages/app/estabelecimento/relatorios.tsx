"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend } from "recharts"
import { TrendingUp } from "lucide-react"
import { DatePickerWithRange } from "./DatePickerWithRange"
import { DateRange } from "react-day-picker"

import {  
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Dados iniciais de tickets
const initialChartData = [
  { mes: "Janeiro", aprovados: 186, consumidos: 80 },
  { mes: "Fevereiro", aprovados: 305, consumidos: 200 },
  { mes: "Março", aprovados: 237, consumidos: 120 },
  { mes: "Abril", aprovados: 73, consumidos: 190 },
  { mes: "Maio", aprovados: 209, consumidos: 130 },
  { mes: "Junho", aprovados: 214, consumidos: 140 },
]

export function RelatoriosEstabelecimento() {
  const [chartWidth, setChartWidth] = useState(500)
  const [chartData, setChartData] = useState(initialChartData)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    const updateChartSize = () => {
      setChartWidth(window.innerWidth < 640 ? window.innerWidth - 40 : 500)
    }

    window.addEventListener("resize", updateChartSize)
    updateChartSize()

    return () => window.removeEventListener("resize", updateChartSize)
  }, [])

  // Atualiza os dados do gráfico com base no intervalo de datas selecionado
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const from = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 1)
      const to = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), 1)

      // Filtra os dados com base no intervalo de meses selecionados
      const filteredData = initialChartData.filter((data) => {
        const mesIndex = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"].indexOf(data.mes)
        const currentDate = new Date(2024, mesIndex, 1)
        return currentDate >= from && currentDate <= to
      })

      setChartData(filteredData)
    } else {
      setChartData(initialChartData)
    }
  }, [dateRange])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Tickets</CardTitle>
        <CardDescription>Filtre por período de datas</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Componente de seleção de período */}
        <DatePickerWithRange
          className="w-full"
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        {/* Gráfico de barras */}
        <BarChart width={chartWidth} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <Tooltip />
          <Legend />
          <Bar dataKey="aprovados" fill="#8884d8" radius={4} />
          <Bar dataKey="consumidos" fill="#82ca9d" radius={4} />
        </BarChart>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Aumento de 5,2% este mês <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando o total de tickets no período selecionado
        </div>
      </CardFooter>
    </Card>
  )
}
