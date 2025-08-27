"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

interface CustomCalendarProps {
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  defaultMonth?: Date;
  initialFocus?: boolean;
  className?: string;
}

export default function CustomCalendar({
  selected,
  onSelect,
  defaultMonth,
  initialFocus,
  className = "border rounded-lg shadow-sm",
}: CustomCalendarProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    selected || new Date(2025, 5, 12),
  );
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    defaultMonth || new Date(2025, 5, 12),
  );

  const currentDate = selected !== undefined ? selected : internalDate;
  const handleSelect = onSelect || setInternalDate;

  // Gerar arrays de meses e anos
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2025, i, 1), "MMMM", { locale: ptBR }),
  }));

  const years = Array.from({ length: 201 }, (_, i) => {
    const year = 1900 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentMonth.getFullYear(), parseInt(month), 1);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), currentMonth.getMonth(), 1);
    setCurrentMonth(newDate);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Dropdowns customizados com shadcn Select */}
      <div className="flex justify-center gap-2">
        <Select
          value={currentMonth.getMonth().toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentMonth.getFullYear().toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar sem dropdown (apenas navegação por botões) */}
      <Calendar
        mode="single"
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        selected={currentDate}
        onSelect={handleSelect}
        initialFocus={initialFocus}
        locale={ptBR}
        className={className}
      />
    </div>
  );
}
