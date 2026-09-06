import { ShippingLineRules } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Clock, ArrowRight } from "lucide-react";

interface ShippingLineCardProps {
  rules?: ShippingLineRules;
}

export default function ShippingLineCard({ rules }: ShippingLineCardProps) {
  if (!rules) {
    return (
      <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center h-full">
        <Clock className="h-8 w-8 text-neutral-600 mb-2" />
        <p className="text-xs text-neutral-500 font-medium">Select a shipping line to preview rule policies.</p>
      </Card>
    );
  }

  const s1_days = rules.slab1_days ?? 7;
  const s2_days = rules.slab2_days ?? 7;

  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl h-full flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
              {rules.line_name} Rules Preset
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-indigo-400" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {/* FREE DAYS */}
          <div className="grid grid-cols-2 gap-3 bg-neutral-900/50 border border-neutral-900 p-3 rounded-lg">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Import Free Days</span>
              <span className="text-base font-bold text-white">{rules.dem_free_days} days</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Export Free Days</span>
              <span className="text-base font-bold text-white">{rules.det_free_days ?? 7} days</span>
            </div>
          </div>

          {/* PROGRESSIVE SLABS */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Accrued Progressive Slabs (Port Demurrage)
            </h5>
            <div className="space-y-1">
              {/* Slab 1 */}
              <div className="flex justify-between items-center py-1.5 border-b border-neutral-900/60 text-neutral-350">
                <span className="flex items-center">
                  Overdue Days 1
                  <ArrowRight className="h-3 w-3 mx-1 text-neutral-600" />
                  {s1_days}
                </span>
                <span className="font-semibold text-white">₹{rules.slab1_rate.toLocaleString("en-IN")}/day</span>
              </div>
              
              {/* Slab 2 */}
              <div className="flex justify-between items-center py-1.5 border-b border-neutral-900/60 text-neutral-350">
                <span className="flex items-center">
                  Overdue Days {s1_days + 1}
                  <ArrowRight className="h-3 w-3 mx-1 text-neutral-600" />
                  {s1_days + s2_days}
                </span>
                <span className="font-semibold text-white">₹{rules.slab2_rate.toLocaleString("en-IN")}/day</span>
              </div>

              {/* Slab 3 */}
              <div className="flex justify-between items-center py-1.5 text-neutral-350">
                <span className="flex items-center">
                  Overdue Days {s1_days + s2_days + 1}+
                  <ArrowRight className="h-3 w-3 mx-1 text-neutral-600" />
                  ∞
                </span>
                <span className="font-semibold text-white">₹{rules.slab3_rate.toLocaleString("en-IN")}/day</span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="px-6 py-4 border-t border-neutral-900/65 bg-neutral-900/10 rounded-b-xl text-[10px] text-neutral-500">
        Updated: {new Date(rules.last_updated || rules.created_at || "").toLocaleDateString()}
      </div>
    </Card>
  );
}
