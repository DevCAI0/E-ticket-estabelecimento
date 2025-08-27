import { useState, useEffect, useRef } from "react";
import {
  Area,
  AreaChart as RechartsArea,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  TooltipProps,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChartData {
  month: string;
  paid: number;
  pending: number;
}

const months = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const generateMonthsData = (currentIndex: number): ChartData[] => {
  const visibleMonths = 6;
  return Array.from({ length: visibleMonths }, (_, i) => {
    const monthIndex = (currentIndex + i) % 12;
    const month = months[monthIndex]; // Garantir que a variável month seja corretamente usada
    return {
      month, // Aqui estamos usando 'month'
      paid: Math.floor(Math.random() * 5000) + 2000,
      pending: Math.floor(Math.random() * 3000) + 1000,
    };
  });
};

const customTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const { month, paid, pending } = payload[0].payload as ChartData;
  return (
    <div className="p-2 border rounded-lg shadow-lg bg-background/95">
      <p className="text-sm font-medium">{month}</p>
      <div className="mt-1 space-y-1">
        <p className="text-xs">
          <span className="text-sky-500">Pagas:</span> R$
          {paid.toLocaleString("pt-BR")}
        </p>
        <p className="text-xs">
          <span className="text-rose-500">Pendentes:</span> R$
          {pending.toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
};

const renderLegend = () => (
  <div className="flex items-center justify-start gap-4 px-4 pt-0 pb-2">
    <div className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-full bg-sky-500"></span>
      <span className="text-xs text-gray-400">Pagas: R$ 5.671</span>
    </div>
    <div className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
      <span className="text-xs text-gray-400">Pendentes: R$ 1.799</span>
    </div>
  </div>
);

export default function AreaChart() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const data = generateMonthsData(currentMonthIndex);

  // Correção no código: pegando a fatia dos meses visíveis sem recalcular
  const visibleMonths = months.slice(currentMonthIndex, currentMonthIndex + 5);

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonthIndex((prev) =>
      direction === "prev"
        ? prev === 0
          ? 11
          : prev - 1
        : prev === 11
          ? 0
          : prev + 1,
    );
  };

  const handleMonthClick = (month: string) => {
    const monthIndex = data.findIndex((item) => item.month === month);
    if (monthIndex !== -1 && chartRef.current) {
      const chartElement = chartRef.current.querySelector(
        ".recharts-layer.recharts-area",
      );
      if (chartElement) {
        const event = new MouseEvent("mouseover", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        chartElement.dispatchEvent(event);
        setHoveredMonth(month);
      }
    }
  };

  useEffect(() => {
    if (data.length > 0 && !hoveredMonth) {
      setHoveredMonth(data[0].month);
    }
  }, [data, hoveredMonth]);

  return (
    <div ref={chartRef} className="relative flex flex-col w-full h-full">
      {renderLegend()}

      <div className="flex-1">
        <ResponsiveContainer>
          <RechartsArea
            data={data}
            margin={{ top: 10, right: 10, left: 20, bottom: 40 }}
            onMouseMove={(e) => {
              if (e?.activePayload && e.activePayload.length > 0) {
                setHoveredMonth(e.activePayload[0].payload.month);
              }
            }}
          >
            <defs>
              <linearGradient id="paid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}>
                  <animate
                    attributeName="stopOpacity"
                    values="0.8;0.5;0.8"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}>
                  <animate
                    attributeName="stopOpacity"
                    values="0.8;0.5;0.8"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis
              orientation="left"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickFormatter={(value) => `R$ ${value}`}
              tickCount={5}
              width={60}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={customTooltip}
              isAnimationActive={true}
              active={true}
            />
            <Area
              type="monotone"
              dataKey="paid"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#paid)"
              isAnimationActive={true}
              animationDuration={1000}
              name="Pagas"
            />
            <Area
              type="monotone"
              dataKey="pending"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#pending)"
              isAnimationActive={true}
              animationDuration={1000}
              name="Pendentes"
            />
          </RechartsArea>
        </ResponsiveContainer>
      </div>

      <div className="absolute left-0 right-0 bottom-2">
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => handleMonthChange("prev")}
            className="p-1 transition-colors rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center justify-between flex-1 px-6">
            {visibleMonths.map((month, index) => (
              <button
                key={index}
                className={`text-xs ${hoveredMonth === month ? "font-medium text-white" : "text-gray-500"}`}
                onClick={() => handleMonthClick(month)}
              >
                {month}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleMonthChange("next")}
            className="p-1 transition-colors rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
