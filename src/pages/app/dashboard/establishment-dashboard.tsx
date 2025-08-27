"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EarningsChart } from "./grafico-ganhos";
import { ActionCard } from "./action-card";
import { dashboardActions } from "./dashboard-actions";
import { motion } from "framer-motion";

export const EstablishmentDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col rounded pb-6"
    >
      {/* Gráfico de Resumo */}
      <div className="p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border border-border">
            <CardContent className="p-0">
              <EarningsChart />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cards de Ação */}
      <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {dashboardActions.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
          >
            <ActionCard
              icon={card.icon}
              title={card.title}
              color={card.color}
              path={card.path}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EstablishmentDashboard;
