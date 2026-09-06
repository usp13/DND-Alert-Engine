import { ShippingLineRules } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RulesTableProps {
  rules: ShippingLineRules[];
  onEdit: (rule: ShippingLineRules) => void;
}

export default function RulesTable({ rules, onEdit }: RulesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Shipping Line Policies preset</h4>
          <p className="text-xs text-neutral-500 mt-0.5">Configure free day policies and progressive pricing slabs.</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-900 bg-neutral-950/20 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-950/40 border-neutral-900">
            <TableRow className="border-neutral-900 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Line</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Import Free Days</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Export Free Days</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Progressive Pricing Slabs (INR/day)</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => {
              const s1_days = rule.slab1_days ?? 7;
              const s2_days = rule.slab2_days ?? 7;
              return (
                <TableRow key={rule.id} className="border-neutral-900 hover:bg-neutral-900/10 text-xs text-neutral-300">
                  {/* LINE */}
                  <TableCell className="font-bold text-white tracking-wide">{rule.line_name} ({rule.line_code})</TableCell>
                  
                  {/* IMPORT */}
                  <TableCell className="font-semibold text-neutral-200">{rule.dem_free_days} days</TableCell>
                  
                  {/* EXPORT */}
                  <TableCell className="font-semibold text-neutral-200">{rule.det_free_days ?? 7} days</TableCell>

                  {/* SLABS */}
                  <TableCell>
                    <div className="flex flex-col gap-1 py-1 text-[11px] text-neutral-400">
                      <span>
                        Days 1–{s1_days}: <strong className="text-white">₹{rule.slab1_rate}</strong>
                      </span>
                      <span>
                        Days {s1_days + 1}–{s1_days + s2_days}: <strong className="text-white">₹{rule.slab2_rate}</strong>
                      </span>
                      <span>
                        Days {s1_days + s2_days + 1}+: <strong className="text-white">₹{rule.slab3_rate}</strong>
                      </span>
                    </div>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <Button
                      onClick={() => onEdit(rule)}
                      variant="ghost"
                      className="h-8 w-8 p-0 text-neutral-500 hover:text-white hover:bg-neutral-900 cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
