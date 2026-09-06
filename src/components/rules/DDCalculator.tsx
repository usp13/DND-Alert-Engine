"use client";

import { useState, useEffect } from "react";
import { DEFAULT_SHIPPING_RULES } from "@/lib/shipping-rules";
import { calculateSlabCharges } from "@/lib/dd-calculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";

export default function DDCalculator() {
  const [selectedLine, setSelectedLine] = useState("Maersk");
  const [overdueDays, setOverdueDays] = useState(5);
  
  const [demurrageCost, setDemurrageCost] = useState(0);
  const [detentionCost, setDetentionCost] = useState(0);

  const activeRules = DEFAULT_SHIPPING_RULES.find((r) => r.line_name === selectedLine);

  useEffect(() => {
    if (activeRules) {
      const dem = calculateSlabCharges(overdueDays, activeRules);
      setDemurrageCost(dem);
      setDetentionCost(Math.round(dem * 0.65)); // simulated detention ratio
    }
  }, [selectedLine, overdueDays, activeRules]);

  const s1_days = activeRules?.slab1_days ?? 7;
  const s2_days = activeRules?.slab2_days ?? 7;

  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
          <Calculator className="h-4 w-4 mr-2 text-indigo-400" />
          Interactive D&D Estimator
        </CardTitle>
        <CardDescription className="text-neutral-500 text-xs">
          Simulate charges by entering a hypothetical period of overdue days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          {/* LINE SELECTOR */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400 uppercase tracking-wider">Shipping Line</label>
            <Select value={selectedLine} onValueChange={(val) => setSelectedLine(val || "Maersk")}>
              <SelectTrigger className="bg-neutral-900 border-neutral-850 text-white h-9">
                <SelectValue placeholder="Select Line" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950 border-neutral-850 text-white">
                {DEFAULT_SHIPPING_RULES.map((r) => (
                  <SelectItem key={r.line_name} value={r.line_name}>
                    {r.line_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* OVERDUE DAYS */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-400 uppercase tracking-wider">Overdue Days</label>
            <Input
              type="number"
              min={1}
              value={overdueDays}
              onChange={(e) => setOverdueDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-neutral-900 border-neutral-855 text-white h-9"
            />
          </div>
        </div>

        {/* RESULTS SPLIT */}
        {activeRules && (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-neutral-900/60 border border-neutral-900 rounded-xl space-y-2.5">
              <div className="flex justify-between text-neutral-400">
                <span>Port Demurrage ({overdueDays} days):</span>
                <span className="text-white font-bold">₹{demurrageCost.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Trailer Detention ({overdueDays} days):</span>
                <span className="text-white font-bold">₹{detentionCost.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-neutral-850 pt-2 flex justify-between font-extrabold text-white text-sm">
                <span>Total Simulated Cost:</span>
                <span className="text-indigo-400">₹{(demurrageCost + detentionCost).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* PROGRESSIVE SLABS PREVIEW */}
            <div className="space-y-1 border border-neutral-900/80 p-2.5 rounded-lg text-[10px] text-neutral-450">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">
                Simulation Slab Parameters
              </span>
              <p>
                Days 1–{s1_days} @ ₹{activeRules.slab1_rate}
              </p>
              <p>
                Days {s1_days + 1}–{s1_days + s2_days} @ ₹{activeRules.slab2_rate}
              </p>
              <p>
                Days {s1_days + s2_days + 1}+ @ ₹{activeRules.slab3_rate}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
