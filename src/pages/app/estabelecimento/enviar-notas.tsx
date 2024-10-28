"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DatePickerWithRange } from "./DatePickerWithRange"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"

// Dados iniciais de tickets
const initialTicketsData = [
  { tipo: "Café", quantidade: 120, valor: 5 },
  { tipo: "Almoço", quantidade: 150, valor: 15 },
  { tipo: "Jantar", quantidade: 100, valor: 10 },
]

export function EnviarNotas() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [ticketsData, setTicketsData] = useState(initialTicketsData)
  const [totalPagar, setTotalPagar] = useState(0)

  // Calcula o valor total a ser pago
  useEffect(() => {
    const total = ticketsData.reduce((acc, item) => acc + item.quantidade * item.valor, 0)
    setTotalPagar(total)
  }, [ticketsData])

  // Filtra os dados de tickets com base no intervalo de datas selecionado
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      // Simula uma filtragem por data (a lógica real deve ser baseada no backend)
      const filteredData = initialTicketsData.filter(() => true)
      setTicketsData(filteredData)
    } else {
      setTicketsData(initialTicketsData)
    }
  }, [dateRange])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Notas</CardTitle>
        <CardDescription>Filtre por período e veja o total a ser pago</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Seletor de período */}
        <DatePickerWithRange
          className="w-full"
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        {/* Exibe informações de tickets */}
        <div className="flex flex-col gap-2">
          {ticketsData.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b">
              <span>{item.tipo}</span>
              <span>{item.quantidade} tickets</span>
              <span>R$ {(item.quantidade * item.valor).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
        {/* Total a pagar */}
        <div className="flex justify-between items-center mt-4 font-bold text-lg">
          <span>Total a pagar:</span>
          <span>R$ {totalPagar.toLocaleString("pt-BR")}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant={"default"}
          className="mt-4"
          onClick={() => alert("Notas enviadas com sucesso!")}
        >
          Enviar Notas
        </Button>
      </CardFooter>
    </Card>
  )
}
