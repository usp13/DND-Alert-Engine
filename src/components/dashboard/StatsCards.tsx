import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/types";
import { 
  Container as ContainerIcon, 
  AlertTriangle, 
  Activity, 
  DollarSign 
} from "lucide-react";

interface StatsCardsProps {
  containers: Container[];
}

export default function StatsCards({ containers }: StatsCardsProps) {
  const activeCount = containers.filter((c) => c.status !== "cleared" && c.status !== "closed").length;
  
  const riskCount = containers.filter(
    (c) => c.status !== "cleared" && c.status !== "closed" && (c.status === "warning" || c.status === "critical")
  ).length;

  const overdueCount = containers.filter(
    (c) => c.status !== "cleared" && c.status !== "closed" && c.status === "overdue"
  ).length;

  const totalCost = containers.reduce(
    (acc, curr) => acc + (curr.total_dd_charges || 0),
    0
  );

  const stats = [
    {
      title: "Active Containers",
      value: activeCount,
      description: "Port & trailer transit",
      icon: ContainerIcon,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
    {
      title: "Risk Alerts",
      value: riskCount,
      description: "Within critical buffer days",
      icon: Activity,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Overdue Containers",
      value: overdueCount,
      description: "Exceeded free days limit",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      title: "Accumulated D&D",
      value: `₹${totalCost.toLocaleString("en-IN")}`,
      description: "Estimated slab charges",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl`}>
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
