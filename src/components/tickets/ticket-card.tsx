import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface TicketCardProps {
  numero: number;
  funcionario?: {
    nome: string;
  } | null;
  tipo_refeicao: string;
  data_emissao: string;
  status_texto: string;
  data_hora_leitura_restaurante?: string | null;
  usuario_leitura?: {
    id: number;
    nome: string;
  } | null;
  index: number;
}

export function TicketCard({
  numero,
  funcionario,
  tipo_refeicao,
  data_emissao,
  status_texto,
  data_hora_leitura_restaurante,
  usuario_leitura,
  index,
}: TicketCardProps) {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              Ticket #{numero}
            </span>
            <span className="rounded bg-secondary px-2 py-1 text-sm text-secondary-foreground">
              {status_texto}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Funcionário</span>
              <span className="text-sm font-medium text-foreground">
                {funcionario?.nome || "N/A"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Refeição</span>
              <span className="text-sm text-foreground">{tipo_refeicao}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Emissão</span>
              <span className="text-sm text-foreground">
                {format(new Date(data_emissao), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </span>
            </div>

            {usuario_leitura && data_hora_leitura_restaurante && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conferido por
                  </span>
                  <span className="text-sm text-foreground">
                    {usuario_leitura.nome}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Data conferência
                  </span>
                  <span className="text-sm text-foreground">
                    {format(
                      new Date(data_hora_leitura_restaurante),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: ptBR,
                      },
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
