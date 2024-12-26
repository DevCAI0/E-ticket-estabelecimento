import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
  ignoreAccents?: boolean;
}

// Função para processar o texto (remover acentos e espaços extras)
const processText = (str: string): string => {
  return str
    .trim() // Remove espaços no início e fim
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, " "); // Remove múltiplos espaços entre palavras
};

export function SearchFilter({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  delay = 300,
  ignoreAccents = true,
}: SearchFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      const processedValue = ignoreAccents
        ? processText(localValue)
        : localValue.trim();
      onChange(processedValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, onChange, ignoreAccents]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={(e) => setLocalValue(e.target.value.trim())}
        className="pl-8"
      />
    </div>
  );
}
