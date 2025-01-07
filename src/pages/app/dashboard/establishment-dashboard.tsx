// src/components/dashboard/establishment-dashboard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { EarningsChart } from "./earnings-chart";
import { ActionCard } from "./action-card";
import { dashboardActions } from "./dashboard-actions";

export const EstablishmentDashboard = () => {
  return (
    <div className="flex flex-col rounded pb-6">
      <div className="p-4">
        <Card className="border border-border">
          <CardContent className="p-0">
            <EarningsChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 px-4">
        {dashboardActions.map((card) => (
          <ActionCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            color={card.color}
            path={card.path}
          />
        ))}
      </div>
    </div>
  );
};

export default EstablishmentDashboard;
