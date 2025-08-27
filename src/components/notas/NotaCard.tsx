// src/components/notas/NotaCard.tsx
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotaRestaurante } from "@/services/notasRestauranteService";
import { FileText, Calendar, DollarSign, User, Receipt } from "lucide-react";

interface NotaCardProps {
  nota: NotaRestaurante;
  index: number;
}

export function NotaCard({ nota, index }: NotaCardProps) {
  // Função para obter o texto correto do status
  const getStatusText = (status: number, statusTexto: string) => {
    switch (status) {
      case 4:
        return "Aprovada";
      case 5:
        return "Paga";
      default:
        return statusTexto; // Usa o texto da API como fallback
    }
  };

  // Função para determinar a cor do status
  const getStatusColor = (status: number) => {
    switch (status) {
      case 4:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case 5:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Função para formatar o CPF/CNPJ
  const formatarCpfCnpj = (documento: string) => {
    if (!documento) return "";

    // Remove caracteres não numéricos
    const numeros = documento.replace(/\D/g, "");

    if (numeros.length === 11) {
      // CPF
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (numeros.length === 14) {
      // CNPJ
      return numeros.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }

    return documento;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="mb-3 transition-all duration-200 border border-border hover:shadow-lg">
        <CardContent className="p-4">
          {/* Header com ID e Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Nota #{nota.id}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs font-medium ${getStatusColor(nota.status)}`}
            >
              {getStatusText(nota.status, nota.status_texto)}
            </Badge>
          </div>

          {/* Informações do Solicitante */}
          <div className="p-3 mb-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Solicitante
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {nota.nome_solicitante}
            </p>
            {nota.cpf_cnpj_solicitante && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {formatarCpfCnpj(nota.cpf_cnpj_solicitante)}
              </p>
            )}
          </div>

          {/* Valor e Tipo de Nota */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {nota.valor_formatado}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{nota.tipo_nota}</span>
            </div>
          </div>

          {/* Datas - Cadastro e Pagamento */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-3 h-3 mt-1 text-muted-foreground" />
              <div className="text-xs">
                <p className="text-muted-foreground">Cadastro:</p>
                <p className="font-medium text-foreground">
                  {nota.data_cadastro_formatada}
                </p>
              </div>
            </div>
            {/* Buscar data de pagamento na API - vamos adicionar isso */}
            <div className="flex items-start gap-2">
              <Calendar className="w-3 h-3 mt-1 text-green-600" />
              <div className="text-xs">
                <p className="text-muted-foreground">Pagamento:</p>
                <p className="font-medium text-foreground">
                  {nota.data_pagamento_formatada || "--/--/----"}
                </p>
              </div>
            </div>
          </div>

          {/* Usuário que cadastrou */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>Cadastrado por:</span>
              <span className="font-medium text-foreground">
                {nota.usuario_cadastro}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
