"use client";

import { useState } from "react";
import { Container } from "@/types";
import { TableRow, TableCell } from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import CountdownTimer from "./CountdownTimer";
import { ChevronDown, ChevronUp, Send, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContainerRowProps {
  container: Container;
  onSendAlert: (containerId: string) => Promise<void>;
  onGateOut: (containerId: string) => Promise<void>;
}

export default function ContainerRow({ container, onSendAlert, onGateOut }: ContainerRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [gatingOut, setGatingOut] = useState(false);

  const handleSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSending(true);
    await onSendAlert(container.id);
    setSending(false);
  };

  const handleGateOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setGatingOut(true);
    await onGateOut(container.id);
    setGatingOut(false);
  };

  const isReturned = !!container.empty_return_date || container.status === "cleared" || container.status === "closed";
  const totalCost = container.total_dd_charges || 0;

  return (
    <>
      <TableRow
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer border-neutral-900 hover:bg-neutral-900/40 transition-colors"
      >
        <TableCell className="w-10">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </TableCell>
        <TableCell className="font-bold text-white tracking-wide">{container.container_number}</TableCell>
        <TableCell className="text-neutral-300">{container.shipping_line}</TableCell>
        <TableCell className="text-neutral-400">{container.discharge_date}</TableCell>
        <TableCell className="text-neutral-400 font-medium">{container.demurrage_lfd}</TableCell>
        <TableCell>
          <CountdownTimer lfd={container.demurrage_lfd} isReturned={isReturned} />
        </TableCell>
        <TableCell>
          <StatusBadge status={container.status} />
        </TableCell>
        <TableCell className="text-right font-semibold text-white">
          {totalCost > 0 ? `₹${totalCost.toLocaleString("en-IN")}` : "—"}
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-neutral-950/40 border-b border-neutral-900 hover:bg-neutral-950/40">
          <TableCell colSpan={8} className="p-4">
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* TIMELINE */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Container Lifecycle
                </h4>
                <div className="relative border-l border-neutral-800 pl-4 space-y-4 text-xs">
                  {/* ARRIVAL */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border border-neutral-850 bg-neutral-950 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                    </div>
                    <p className="font-semibold text-white">Port Discharge</p>
                    <p className="text-neutral-400">{container.discharge_date}</p>
                  </div>
                  {/* LFD */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border border-rose-900 bg-rose-950 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    </div>
                    <p className="font-semibold text-rose-400">Demurrage LFD</p>
                    <p className="text-neutral-400">{container.demurrage_lfd} ({container.demurrage_free_days} free days)</p>
                  </div>
                  {/* DETENTION LFD */}
                  {container.detention_lfd && (
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border border-amber-900 bg-amber-950 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      </div>
                      <p className="font-semibold text-white">Detention LFD</p>
                      <p className="text-neutral-400">{container.detention_lfd} ({container.detention_free_days || 0} free days)</p>
                    </div>
                  )}
                  {/* RETURNED */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                      isReturned ? "border-emerald-800 bg-emerald-950" : "border-neutral-850 bg-neutral-950"
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${isReturned ? "bg-emerald-500" : "bg-neutral-700"}`} />
                    </div>
                    <p className="font-semibold text-white">Returned empty container</p>
                    <p className="text-neutral-400">{container.empty_return_date || "Outstanding transit"}</p>
                  </div>
                </div>
              </div>

              {/* DND CHARGES BREAKDOWN */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Accrued Demurrage/Detention Slabs
                </h4>
                {totalCost > 0 ? (
                  <div className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-3 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Demurrage Charges:</span>
                      <span className="text-white font-medium">₹{(container.demurrage_charges || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Detention Charges:</span>
                      <span className="text-white font-medium">₹{(container.detention_charges || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="border-t border-neutral-850 pt-2 flex justify-between font-bold text-white">
                      <span>Total Estimated Cost:</span>
                      <span className="text-indigo-400">₹{totalCost.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">No Demurrage or Detention costs accumulated yet.</p>
                )}
                {container.bl_number && (
                  <div className="text-[11px] text-neutral-500 space-y-0.5 pt-2">
                    <p>Bill of Lading: <strong className="text-neutral-400">{container.bl_number}</strong></p>
                    {container.vessel_name && <p>Vessel Name: <strong className="text-neutral-400">{container.vessel_name}</strong></p>}
                    {container.port && <p>Port Name: <strong className="text-neutral-400">{container.port}</strong></p>}
                  </div>
                )}
              </div>

              {/* QUICK ACTIONS */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Operational Control
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Manually push instant driver templates via WhatsApp or flag the box as returned empty to stop slab calculations.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={sending || isReturned}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-850 hover:text-white justify-start text-xs h-9 cursor-pointer"
                  >
                    <Send className="h-3 w-3 mr-2 text-indigo-400" />
                    {sending ? "Sending WhatsApp..." : "Send Alert via WhatsApp"}
                  </Button>
                  
                  {!isReturned && (
                    <Button
                      onClick={handleGateOut}
                      disabled={gatingOut}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 justify-start text-xs h-9 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      {gatingOut ? "Updating state..." : "Flag Empty Returned"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
