"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Check } from "lucide-react";
import { ExtractedContainer } from "@/lib/pdf-import-engine";

interface ExtractionPreviewProps {
  initialContainers: ExtractedContainer[];
  onConfirm: (containers: ExtractedContainer[]) => Promise<void>;
  onCancel: () => void;
}

export default function ExtractionPreview({ initialContainers, onConfirm, onCancel }: ExtractionPreviewProps) {
  const [containers, setContainers] = useState<ExtractedContainer[]>(initialContainers);
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (index: number, field: keyof ExtractedContainer, value: any) => {
    setContainers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setContainers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(containers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-neutral-950/40 p-6 border border-neutral-900 rounded-2xl">
      <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Automated Extraction Review</h4>
          <p className="text-xs text-neutral-500 mt-0.5">Edit any incorrect values. Clear rows if needed.</p>
        </div>
        <span className="text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded-full font-medium">
          {containers.length} boxes found
        </span>
      </div>

      <div className="rounded-xl border border-neutral-900 bg-neutral-950/20 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-950/40 border-neutral-900">
            <TableRow className="border-neutral-900">
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Container Number</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Shipping Line</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Discharge Date</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Free Days</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Booking / BL</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.length === 0 ? (
              <TableRow className="border-neutral-900">
                <TableCell colSpan={6} className="text-center py-6 text-xs text-neutral-500 italic">
                  No containers in preview list.
                </TableCell>
              </TableRow>
            ) : (
              containers.map((c, index) => (
                <TableRow key={index} className="border-neutral-900 hover:bg-transparent">
                  {/* CONTAINER NUMBER */}
                  <TableCell>
                    <Input
                      value={c.container_number}
                      onChange={(e) => handleFieldChange(index, "container_number", e.target.value.toUpperCase())}
                      className="bg-neutral-900 border-neutral-850 text-white font-mono tracking-widest uppercase text-xs h-8"
                    />
                  </TableCell>
                  
                  {/* SHIPPING LINE */}
                  <TableCell>
                    <Input
                      value={c.shipping_line}
                      onChange={(e) => handleFieldChange(index, "shipping_line", e.target.value)}
                      className="bg-neutral-900 border-neutral-850 text-white text-xs h-8 w-28"
                    />
                  </TableCell>

                  {/* DISCHARGE */}
                  <TableCell>
                    <Input
                      type="date"
                      value={c.discharge_date}
                      onChange={(e) => handleFieldChange(index, "discharge_date", e.target.value)}
                      className="bg-neutral-900 border-neutral-850 text-white text-xs h-8 w-36"
                    />
                  </TableCell>

                  {/* FREE DAYS */}
                  <TableCell>
                    <Input
                      type="number"
                      value={c.demurrage_free_days}
                      onChange={(e) => handleFieldChange(index, "demurrage_free_days", parseInt(e.target.value) || 0)}
                      className="bg-neutral-900 border-neutral-850 text-white text-xs h-8 w-20"
                    />
                  </TableCell>

                  {/* BOOKING / BL */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Booking"
                        value={c.booking_number || ""}
                        onChange={(e) => handleFieldChange(index, "booking_number", e.target.value)}
                        className="bg-neutral-900 border-neutral-850 text-white text-xs h-8 w-24"
                      />
                      <Input
                        placeholder="BL"
                        value={c.bl_number || ""}
                        onChange={(e) => handleFieldChange(index, "bl_number", e.target.value)}
                        className="bg-neutral-900 border-neutral-850 text-white text-xs h-8 w-24"
                      />
                    </div>
                  </TableCell>

                  {/* DELETE */}
                  <TableCell>
                    <Button
                      onClick={() => handleRemoveRow(index)}
                      variant="ghost"
                      className="h-8 w-8 p-0 text-neutral-500 hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-neutral-850 text-neutral-300 hover:bg-neutral-900 cursor-pointer text-xs h-9 px-4"
          disabled={loading}
        >
          Discard All
        </Button>
        <Button
          onClick={handleConfirmSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 cursor-pointer text-xs h-9 px-4"
          disabled={loading || containers.length === 0}
        >
          <Check className="h-4 w-4 mr-1.5" />
          {loading ? "Importing..." : "Confirm & Import to Dashboard"}
        </Button>
      </div>
    </div>
  );
}
