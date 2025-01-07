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

const processText = (str: string): string => {
  return str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ");
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
