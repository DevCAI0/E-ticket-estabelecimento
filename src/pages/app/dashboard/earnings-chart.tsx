interface ChartData {
  category: string;
  amount: number;
  color: string;
  radius: number;
}

export const EarningsChart = () => {
  const data: ChartData[] = [
    {
      category: "Tickets 24h",
      amount: 251000,
      color: "hsl(var(--chart-1))",
      radius: 42,
    },
    {
      category: "Pendentes",
      amount: 179000,
      color: "hsl(var(--chart-2))",
      radius: 30,
    },
  ];

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const calculateStrokeDashArray = (amount: number) => {
    return (amount / total) * 100;
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
            <span className="text-sm text-muted-foreground">
              {item.category}
            </span>
            <span className="text-sm font-medium">
              {(item.amount / 1000).toFixed(1)}k
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
