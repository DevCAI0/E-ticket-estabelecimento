// components/notas/UpcomingNotes.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function UpcomingNotes() {
  const upcoming = [
    {
      id: 1,
      number: "NF-003",
      value: 1800,
      dueDate: "2024-03-15",
    },
    // Add more notes...
  ];

  return (
    <div className="space-y-4">
      {upcoming.map((note) => (
        <Card key={note.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{note.number}</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(note.value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vence em {new Date(note.dueDate).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
