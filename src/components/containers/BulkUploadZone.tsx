"use client";

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
}

export default function BulkUploadZone({ onUpload }: BulkUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    const isExcel = selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls") || selectedFile.name.endsWith(".csv");
    if (!isExcel) {
      setError("Please upload an Excel spreadsheet (.xlsx, .xls) or CSV file.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setUploadStatus("idle");
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setUploadStatus("loading");
    try {
      await onUpload(file);
      setUploadStatus("success");
    } catch (err: any) {
      setError(err.message || "Failed uploading file.");
      setUploadStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-indigo-500 bg-indigo-950/20"
            : file
            ? "border-emerald-600/50 bg-emerald-950/5"
            : "border-neutral-800 bg-neutral-950/30 hover:border-neutral-700"
        }`}
      >
        <input
          type="file"
          id="excel-file-input"
          accept=".xlsx, .xls, .csv"
          onChange={handleChange}
          className="hidden"
        />

        {file ? (
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ) : (
          <label htmlFor="excel-file-input" className="w-full h-full cursor-pointer py-4 space-y-3">
            <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center justify-center shadow-lg">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Drag & drop your Excel spreadsheet</p>
              <p className="text-xs text-neutral-500 mt-1">or click to browse from local computer</p>
              <p className="text-[10px] text-neutral-600 mt-2">Supports .xlsx, .xls, and .csv files</p>
            </div>
          </label>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-900/50 p-3 text-xs text-emerald-400 flex items-start space-x-2">
          <CheckCircle className="h-4 w-4 mt-0.5" />
          <span>Sheet processed successfully! Mapped entries are uploaded to dashboard.</span>
        </div>
      )}

      {file && uploadStatus !== "success" && (
        <div className="flex gap-3">
          <Button
            onClick={() => setFile(null)}
            variant="outline"
            className="flex-1 border-neutral-850 text-neutral-300 hover:bg-neutral-900 cursor-pointer"
            disabled={uploadStatus === "loading"}
          >
            Clear File
          </Button>
          <Button
            onClick={handleUploadSubmit}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0 cursor-pointer"
            disabled={uploadStatus === "loading"}
          >
            {uploadStatus === "loading" ? "Processing..." : "Process Bulk Upload"}
          </Button>
        </div>
      )}
    </div>
  );
}
