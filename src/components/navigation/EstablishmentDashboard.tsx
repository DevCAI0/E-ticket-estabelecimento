import { CreditCard, FileText, TrendingUp, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ChartData {
  category: string;
  amount: number;
  color: string;
  radius: number;
}

const EarningsChart = () => {
  const data: ChartData[] = [
    {
      category: "Tickets 24h",
      amount: 251000,
      color: "rgb(34, 197, 94)",
      radius: 42,
    },
    {
      category: "Pendentes",
      amount: 179000,
      color: "rgb(251, 146, 60)",
      radius: 30,
    },
  ];

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const calculateStrokeDashArray = (amount: number): number => {
    const percentage = (amount / total) * 100;
    return percentage;
  };

  return (
    <div className="flex flex-row items-center justify-between gap-4 p-6">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          {data.map((item) => {
            const circumference = 2 * Math.PI * item.radius;
            const percent = calculateStrokeDashArray(item.amount);
            const dashArray = `${(percent * circumference) / 100} ${circumference}`;

            return (
              <circle
                key={item.category}
                cx="50"
                cy="50"
                r={item.radius}
                fill="none"
                stroke={item.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={dashArray}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col space-y-2">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-zinc-300">{item.category}</span>
            <span className="text-sm font-medium">
              {(item.amount / 1000).toFixed(1)}k
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EstablishmentDashboard = () => {
  return (
    <div className="flex min-h-screen flex-col rounded border border-zinc-800 text-white">
      {/* Chart */}
      <div className="p-4">
        <Card className="border border-zinc-800">
          <CardContent className="p-0">
            <EarningsChart />
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-4">
        <Card className="border border-zinc-800 transition-colors hover:bg-zinc-900">
          <CardContent className="flex aspect-square flex-col items-center justify-center p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500">
              <RefreshCcw className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 font-medium">Ler Tickets</h3>
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 transition-colors hover:bg-zinc-900">
          <CardContent className="flex aspect-square flex-col items-center justify-center p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-violet-500">
              <CreditCard
                className="h-5 w-5 text-violet-500"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="mb-1 font-medium">Faturamento</h3>
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 transition-colors hover:bg-zinc-900">
          <CardContent className="flex aspect-square flex-col items-center justify-center p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-green-500">
              <FileText className="h-5 w-5 text-green-500" strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 font-medium">Notas Fiscais</h3>
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 transition-colors hover:bg-zinc-900">
          <CardContent className="flex aspect-square flex-col items-center justify-center p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-amber-500">
              <TrendingUp
                className="h-5 w-5 text-amber-500"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="mb-1 font-medium">Relatórios</h3>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstablishmentDashboard;
