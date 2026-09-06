import { ContainerStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status?: ContainerStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "cleared":
    case "closed":
      return (
        <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 font-semibold px-2 py-0.5 rounded-md hover:bg-emerald-950/40">
          Returned
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 font-semibold px-2 py-0.5 rounded-md hover:bg-emerald-950/40">
          Safe
        </Badge>
      );
    case "warning":
      return (
        <Badge className="bg-amber-950/40 text-amber-400 border border-amber-900/60 font-semibold px-2 py-0.5 rounded-md hover:bg-amber-950/40">
          Warning
        </Badge>
      );
    case "critical":
      return (
        <Badge className="bg-red-950/40 text-red-400 border border-red-900/60 font-semibold px-2 py-0.5 rounded-md hover:bg-red-950/40 animate-pulse">
          Critical
        </Badge>
      );
    case "overdue":
      return (
        <Badge className="bg-neutral-900 text-neutral-300 border border-neutral-800 font-semibold px-2 py-0.5 rounded-md hover:bg-neutral-900">
          Overdue
        </Badge>
      );
    default:
      return (
        <Badge className="bg-neutral-950 text-neutral-400 border border-neutral-900 font-medium px-2 py-0.5 rounded-md hover:bg-neutral-950">
          Unknown
        </Badge>
      );
  }
}
