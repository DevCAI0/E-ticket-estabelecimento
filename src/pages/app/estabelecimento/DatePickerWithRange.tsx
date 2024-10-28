"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"  // Importa o locale para português do Brasil
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
}

export function DatePickerWithRange({ className, dateRange, setDateRange }: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              )
            ) : (
              <span>Escolha o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => setDateRange(range)}
            numberOfMonths={2}
            locale={ptBR}  // Define o calendário para português do Brasil
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
