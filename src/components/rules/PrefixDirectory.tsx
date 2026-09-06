"use client";

import { useState } from "react";
import { CONTAINER_PREFIXES } from "@/lib/container-prefixes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Compass } from "lucide-react";

export default function PrefixDirectory() {
  const [search, setSearch] = useState("");

  const filtered = CONTAINER_PREFIXES.filter(
    (item) =>
      item.prefix.toLowerCase().includes(search.toLowerCase()) ||
      item.line_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-neutral-900 bg-neutral-950/40 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
          <Compass className="h-4 w-4 mr-2 text-indigo-400" />
          Container Prefix Registry
        </CardTitle>
        <CardDescription className="text-neutral-500 text-xs">
          Match a box's 4-letter ISO prefix to its parent shipping carrier.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <Input
            placeholder="Search prefix (e.g. MSKU, NYKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-neutral-900 border-neutral-850 text-white text-xs h-8"
          />
        </div>

        {/* LIST TABLE */}
        <div className="rounded-lg border border-neutral-900 max-h-48 overflow-y-auto pr-1">
          <Table>
            <TableHeader className="bg-neutral-950/60 border-neutral-900 sticky top-0">
              <TableRow className="border-neutral-900">
                <TableHead className="text-[10px] font-bold text-neutral-450 uppercase h-8 py-1">Prefix</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-450 uppercase h-8 py-1">Shipping Line</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="border-neutral-900">
                  <TableCell colSpan={2} className="text-center py-4 text-[10px] text-neutral-500 italic">
                    No matching prefixes found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.prefix} className="border-neutral-900/60 hover:bg-neutral-900/10 h-8 py-1 text-neutral-300">
                    <TableCell className="font-mono font-bold text-white uppercase tracking-wider">{item.prefix}</TableCell>
                    <TableCell>{item.line_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
