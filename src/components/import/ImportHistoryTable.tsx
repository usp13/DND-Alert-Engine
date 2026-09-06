import { PDFImport } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ImportHistoryTableProps {
  history: PDFImport[];
}

export default function ImportHistoryTable({ history }: ImportHistoryTableProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Document Ingestion History</h4>
        <p className="text-xs text-neutral-500 mt-0.5">Past PDF delivery orders and invoice files parsed.</p>
      </div>

      <div className="rounded-xl border border-neutral-900 bg-neutral-950/20 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-950/40 border-neutral-900">
            <TableRow className="border-neutral-900">
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Document Name</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Source</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Scan Status</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Extracted Count</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Imported Count</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Date Scanned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow className="border-neutral-900">
                <TableCell colSpan={6} className="text-center py-6 text-xs text-neutral-500 italic">
                  No import history recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              history.map((h) => (
                <TableRow key={h.id} className="border-neutral-900 hover:bg-transparent text-xs text-neutral-300">
                  {/* NAME */}
                  <TableCell className="font-semibold text-white flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-neutral-500" />
                    <span>{h.file_name}</span>
                  </TableCell>

                  {/* SOURCE */}
                  <TableCell className="text-neutral-450 uppercase font-medium">{h.source || "web_upload"}</TableCell>

                  {/* STATUS */}
                  <TableCell>
                    {h.status === "completed" && (
                      <span className="flex items-center text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Success
                      </span>
                    )}
                    {h.status === "failed" && (
                      <span className="flex items-center text-red-400 font-semibold" title={h.error_message}>
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Failed
                      </span>
                    )}
                    {h.status === "processing" && (
                      <span className="flex items-center text-amber-400 font-semibold">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Processing
                      </span>
                    )}
                  </TableCell>

                  {/* EXTRACTED */}
                  <TableCell>{h.containers_found || 0} containers</TableCell>

                  {/* IMPORTED */}
                  <TableCell>{h.containers_added || 0} boxes</TableCell>

                  {/* DATE */}
                  <TableCell className="text-neutral-550">
                    {h.created_at ? new Date(h.created_at).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
