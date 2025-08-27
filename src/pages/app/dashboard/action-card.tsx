import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  color: string; // Pode ser '--chart-1', '--chart-2', etc.
  path: string;
  className?: string;
}

export const ActionCard = ({
  icon: Icon,
  title,
  color,
  path,
  className,
}: ActionCardProps) => {
  // Garantir que a cor tenha o formato correto para hsl
  const formattedColor = color.startsWith("--") ? color : `--${color}`;

  return (
    <Link to={path}>
      <Card
        className={cn(
          "cursor-pointer border-border transition-all duration-200 hover:bg-accent hover:shadow-sm",
          className,
        )}
      >
        <CardContent className="flex aspect-square flex-col items-center justify-center p-4">
          <div
            className="mb-2 flex h-8 w-8 items-center justify-center rounded-full border"
            style={{ borderColor: `hsl(var(${formattedColor}))` }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: `hsl(var(${formattedColor}))` }}
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-sm font-medium">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};

// Versão alternativa com cores predefinidas para facilitar o uso
export const ActionCardWithPresetColor = ({
  icon: Icon,
  title,
  colorPreset = "chart-1", // Valores possíveis: chart-1, chart-2, chart-3, chart-4, chart-5
  path,
  className,
}: Omit<ActionCardProps, "color"> & {
  colorPreset?: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
}) => {
  const colorMap = {
    "chart-1": "--chart-1",
    "chart-2": "--chart-2",
    "chart-3": "--chart-3",
    "chart-4": "--chart-4",
    "chart-5": "--chart-5",
  };

  return (
    <Link to={path}>
      <Card
        className={cn(
          "cursor-pointer border-border transition-all duration-200 hover:bg-accent hover:shadow-sm",
          className,
        )}
      >
        <CardContent className="flex aspect-square flex-col items-center justify-center p-4">
          <div
            className="mb-2 flex h-8 w-8 items-center justify-center rounded-full border"
            style={{ borderColor: `hsl(var(${colorMap[colorPreset]}))` }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: `hsl(var(${colorMap[colorPreset]}))` }}
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-sm font-medium">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};
