"use client";

import { useState, useMemo } from "react";
import { Container } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ContainerRow from "./ContainerRow";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

interface ContainerTableProps {
  containers: Container[];
  onSendAlert: (containerId: string) => Promise<void>;
  onGateOut: (containerId: string) => Promise<void>;
}

type SortField = "container_number" | "discharge_date" | "demurrage_lfd" | "cost";
type SortOrder = "asc" | "desc";

export default function ContainerTable({ containers, onSendAlert, onGateOut }: ContainerTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lineFilter, setLineFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("demurrage_lfd");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Get list of lines for filter
  const lines = useMemo(() => {
    const set = new Set(containers.map((c) => c.shipping_line));
    return Array.from(set);
  }, [containers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter & Sort containers
  const filteredAndSortedContainers = useMemo(() => {
    return containers
      .filter((c) => {
        const matchesSearch = c.container_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.bl_number && c.bl_number.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "active" && c.status !== "cleared" && c.status !== "closed") ||
          (statusFilter === "gate_out" && (c.status === "cleared" || c.status === "closed")) ||
          (statusFilter === "overdue" && c.status === "overdue");

        const matchesLine = lineFilter === "all" || c.shipping_line === lineFilter;

        return matchesSearch && matchesStatus && matchesLine;
      })
      .sort((a, b) => {
        let valA: any = a[sortField === "cost" ? "total_dd_charges" : sortField] || "";
        let valB: any = b[sortField === "cost" ? "total_dd_charges" : sortField] || "";

        if (sortField === "cost") {
          valA = a.total_dd_charges || 0;
          valB = b.total_dd_charges || 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [containers, searchQuery, statusFilter, lineFilter, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-neutral-950/40 p-4 border border-neutral-900 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search by container / BL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-neutral-900 border-neutral-855 text-white text-xs h-9"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3 items-center">
          {/* Status Filter */}
          <div className="w-full md:w-44">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="bg-neutral-900 border-neutral-850 text-white text-xs h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950 border-neutral-850 text-white text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Transit</SelectItem>
                <SelectItem value="gate_out">Returned Empty</SelectItem>
                <SelectItem value="overdue">Overdue Boxes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Filter */}
          <div className="w-full md:w-44">
            <Select value={lineFilter} onValueChange={(val) => setLineFilter(val || "all")}>
              <SelectTrigger className="bg-neutral-900 border-neutral-855 text-white text-xs h-9">
                <SelectValue placeholder="All Lines" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-950 border-neutral-850 text-white text-xs">
                <SelectItem value="all">All Shipping Lines</SelectItem>
                {lines.map((line) => (
                  <SelectItem key={line} value={line}>
                    {line}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-neutral-900 bg-neutral-950/20 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-950/60 border-neutral-900">
            <TableRow className="border-neutral-900 hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead
                className="cursor-pointer text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-white"
                onClick={() => handleSort("container_number")}
              >
                <div className="flex items-center">
                  <span>Container No.</span>
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Line
              </TableHead>
              <TableHead
                className="cursor-pointer text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-white"
                onClick={() => handleSort("discharge_date")}
              >
                <div className="flex items-center">
                  <span>Discharge Date</span>
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-white"
                onClick={() => handleSort("demurrage_lfd")}
              >
                <div className="flex items-center">
                  <span>LFD</span>
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Countdown
              </TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Alert Status
              </TableHead>
              <TableHead
                className="cursor-pointer text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-white"
                onClick={() => handleSort("cost")}
              >
                <div className="flex items-center justify-end">
                  <span>D&D Accrued</span>
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedContainers.length === 0 ? (
              <TableRow className="border-neutral-900">
                <TableCell colSpan={8} className="text-center py-10 text-xs text-neutral-500 italic">
                  No containers found matching filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedContainers.map((container) => (
                <ContainerRow
                  key={container.id}
                  container={container}
                  onSendAlert={onSendAlert}
                  onGateOut={onGateOut}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
