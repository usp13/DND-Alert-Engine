"use client";

import { useState, useEffect } from "react";
import { getLineByPrefix, validateContainerNumber } from "@/lib/container-prefixes";
import { getRulesForLine } from "@/lib/shipping-rules";
import { calculateLFD } from "@/lib/lfd-calculator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, PlusCircle } from "lucide-react";

interface AddContainerFormProps {
  onSubmit: (containerData: any) => Promise<void>;
  onLineSelect: (lineName: string) => void;
}

const getLineCode = (line: string) => {
  switch (line) {
    case "Maersk": return "MAEU";
    case "MSC": return "MEDU";
    case "COSCO": return "COSU";
    case "ONE": return "ONEY";
    default: return line.substring(0, 4).toUpperCase();
  }
};

export default function AddContainerForm({ onSubmit, onLineSelect }: AddContainerFormProps) {
  const [containerNumber, setContainerNumber] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [freeDays, setFreeDays] = useState(14);
  const [eta, setEta] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [blNumber, setBlNumber] = useState("");
  
  const [numberError, setNumberError] = useState("");
  const [calculatedLfd, setCalculatedLfd] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-detect shipping line on prefix match
  useEffect(() => {
    if (containerNumber.length >= 4) {
      const line = getLineByPrefix(containerNumber);
      if (line !== "Unknown") {
        setShippingLine(line);
        onLineSelect(line);

        const rules = getRulesForLine(line);
        if (rules) {
          setFreeDays(rules.dem_free_days);
        }
      }
    }
  }, [containerNumber, onLineSelect]);

  // Recalculate LFD dynamically
  useEffect(() => {
    const referenceDate = dischargeDate || eta;
    if (referenceDate && freeDays > 0) {
      const lfd = calculateLFD(referenceDate, freeDays);
      setCalculatedLfd(lfd);
    } else {
      setCalculatedLfd("");
    }
  }, [eta, dischargeDate, freeDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNumberError("");

    if (!validateContainerNumber(containerNumber)) {
      setNumberError("Invalid ISO 6346 format (e.g. MSKU1234567).");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        container_number: containerNumber.toUpperCase(),
        shipping_line: shippingLine,
        shipping_line_code: getLineCode(shippingLine),
        demurrage_free_days: freeDays,
        discharge_date: dischargeDate || eta,
        bl_number: blNumber,
        demurrage_lfd: calculatedLfd,
        notes: bookingNumber ? `Booking: ${bookingNumber}` : undefined,
      });
      // Clear form on success
      setContainerNumber("");
      setShippingLine("");
      setFreeDays(14);
      setEta("");
      setDischargeDate("");
      setBookingNumber("");
      setBlNumber("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white flex items-center">
          <PlusCircle className="h-5 w-5 mr-2 text-indigo-400" />
          Container Details
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Enter operational dates and box metadata below. Mapped slabs will compute costs automatically.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid md:grid-cols-2 gap-4">
            {/* CONTAINER NUMBER */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 uppercase tracking-wider">Container Number</label>
              <Input
                placeholder="e.g. MSKU9087654"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                className="bg-neutral-900 border-neutral-850 text-white font-mono tracking-widest"
                required
              />
              {numberError && (
                <p className="text-[10px] text-red-400 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {numberError}
                </p>
              )}
            </div>

            {/* SHIPPING LINE */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 uppercase tracking-wider">Shipping Line</label>
              <Select
                value={shippingLine}
                onValueChange={(val) => {
                  if (val) {
                    setShippingLine(val);
                    onLineSelect(val);
                    const rules = getRulesForLine(val);
                    if (rules) {
                      setFreeDays(rules.dem_free_days);
                    }
                  }
                }}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-850 text-white h-9">
                  <SelectValue placeholder="Select Shipping Line" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-950 border-neutral-850 text-white">
                  <SelectItem value="Maersk">Maersk</SelectItem>
                  <SelectItem value="MSC">MSC</SelectItem>
                  <SelectItem value="COSCO">COSCO</SelectItem>
                  <SelectItem value="ONE">ONE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* ETA */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 uppercase tracking-wider">Estimated Arrival (ETA)</label>
              <Input
                type="date"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="bg-neutral-900 border-neutral-850 text-white h-9"
                required
              />
            </div>

            {/* DISCHARGE */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 uppercase tracking-wider">Discharge Date (Port)</label>
              <Input
                type="date"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="bg-neutral-900 border-neutral-850 text-white h-9"
              />
            </div>

            {/* FREE DAYS */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 uppercase tracking-wider">Free Days Allowance</label>
              <Input
                type="number"
                min={0}
                value={freeDays}
                onChange={(e) => setFreeDays(parseInt(e.target.value) || 0)}
                className="bg-neutral-900 border-neutral-850 text-white h-9"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* BOOKING */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 uppercase tracking-wider">Booking Number (Optional)</label>
              <Input
                placeholder="e.g. BKG-00898"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                className="bg-neutral-900 border-neutral-850 text-white h-9"
              />
            </div>

            {/* BL */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 uppercase tracking-wider">Bill of Lading (BL) Number</label>
              <Input
                placeholder="e.g. BL-776228"
                value={blNumber}
                onChange={(e) => setBlNumber(e.target.value)}
                className="bg-neutral-900 border-neutral-850 text-white h-9"
              />
            </div>
          </div>

          {/* LFD PREVIEW */}
          {calculatedLfd && (
            <div className="flex items-center space-x-2 bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-lg text-indigo-400">
              <Calendar className="h-4 w-4" />
              <span>
                Computed Last Free Day (LFD): <strong className="text-white">{calculatedLfd}</strong> (calculated from {dischargeDate ? "discharge" : "ETA"} reference)
              </span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md cursor-pointer h-10 text-xs font-semibold"
          >
            {loading ? "Adding..." : "Add Container Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
