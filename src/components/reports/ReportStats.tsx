import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, Percent, AlertTriangle } from "lucide-react";

interface ReportStatsProps {
  totalContainers: number;
  containersWithDD: number;
  totalActualCost: number;
  totalHypotheticalCost: number;
  totalSavings: number;
}

export default function ReportStats({
  totalContainers,
  containersWithDD,
  totalActualCost,
  totalHypotheticalCost,
  totalSavings,
}: ReportStatsProps) {
  
  const savingsPercent = totalHypotheticalCost > 0 
    ? Math.round((totalSavings / totalHypotheticalCost) * 100) 
    : 0;

  const stats = [
    {
      title: "Total Tracked Boxes",
      value: totalContainers,
      description: `${containersWithDD} accrued D&D charges`,
      icon: Activity,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
    },
    {
      title: "Actual D&D Cost",
      value: `₹${totalActualCost.toLocaleString("en-IN")}`,
      description: "Real demurrage/detention paid",
      icon: DollarSign,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Prevented Charges",
      value: `₹${totalSavings.toLocaleString("en-IN")}`,
      description: "Saved by returning before LFD",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Net Savings Ratio",
      value: `${savingsPercent}%`,
      description: "Saved out of hypothetical risk",
      icon: Percent,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-neutral-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
