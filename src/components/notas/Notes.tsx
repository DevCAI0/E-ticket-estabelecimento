// components/notas/Notes.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck } from "lucide-react";

export function Notes() {
  const notes = [
    {
      id: 1,
      number: "NF-001",
      value: 1500,
      date: "2024-01-15",
      status: "paid",
    },
    // Add more notes...
  ];

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{note.number}</CardTitle>
            <BadgeCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(note.value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pago em {new Date(note.date).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
