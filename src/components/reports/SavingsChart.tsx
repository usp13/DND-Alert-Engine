"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface SavingsChartProps {
  data: {
    month: string;
    actual: number;
    savings: number;
  }[];
}

export default function SavingsChart({ data }: SavingsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl p-6 h-[350px] flex items-center justify-center">
        <span className="text-xs text-neutral-500 font-medium">Loading savings chart...</span>
      </Card>
    );
  }

  // Format INR labels
  const formatYAxis = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-neutral-850 bg-neutral-950 p-3 shadow-xl text-xs space-y-1">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} className="flex justify-between gap-6" style={{ color: p.color }}>
              <span className="capitalize">{p.name}:</span>
              <span className="font-bold">₹{p.value.toLocaleString("en-IN")}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
          Actual Charges vs. Prevented Savings
        </CardTitle>
        <CardDescription className="text-neutral-500 text-xs">
          Comparing direct losses against savings derived from proactive WhatsApp alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#525252" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              stroke="#525252"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", textTransform: "capitalize" }}
            />
            <Bar dataKey="actual" name="actual cost" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={45} />
            <Bar dataKey="savings" name="saved charges" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
