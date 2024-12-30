// src/components/dashboard/action-card.tsx
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  color: string;
  path: string;
}

export const ActionCard = ({
  icon: Icon,
  title,
  color,
  path,
}: ActionCardProps) => {
  return (
    <Link to={path}>
      <Card className="cursor-pointer border-border transition-colors hover:bg-accent">
        <CardContent className="flex aspect-square flex-col items-center justify-center p-4">
          <div
            className="mb-2 flex h-8 w-8 items-center justify-center rounded-full border"
            style={{ borderColor: `hsl(var(${color}))` }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: `hsl(var(${color}))` }}
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-sm font-medium">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};
