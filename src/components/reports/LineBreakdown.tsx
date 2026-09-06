"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface LineBreakdownProps {
  data: {
    lineName: string;
    actualCost: number;
  }[];
}

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#fbbf24", "#a855f7"];

export default function LineBreakdown({ data }: LineBreakdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl p-6 h-[350px] flex items-center justify-center">
        <span className="text-xs text-neutral-500 font-medium">Loading breakdown chart...</span>
      </Card>
    );
  }

  // Filter out zero entries
  const chartData = data.filter((item) => item.actualCost > 0);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      return (
        <div className="rounded-xl border border-neutral-850 bg-neutral-950 p-3 shadow-xl text-xs">
          <p className="font-bold text-white mb-0.5">{p.name}</p>
          <p className="font-semibold text-indigo-400">₹{p.value.toLocaleString("en-IN")}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
          Charges by Shipping Line
        </CardTitle>
        <CardDescription className="text-neutral-500 text-xs">
          Demurrage cost distribution showing which carriers accumulate the highest losses.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full flex flex-col justify-center">
        {chartData.length === 0 ? (
          <div className="text-center py-10 text-xs text-neutral-500 italic">
            No charges accrued across shipping lines.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="actualCost"
                nameKey="lineName"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{ fontSize: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
