"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFDropzoneProps {
  onExtractSuccess: (extractedData: any[], fileName: string) => void;
}

export default function PDFDropzone({ onExtractSuccess }: PDFDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "success" | "failed">("idle");
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
    const isPDF = selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf");
    if (!isPDF) {
      setError("Only PDF files are supported.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setStatus("idle");
  };

  // Convert PDF file to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Strip the data:application/pdf;base64, header prefix
        const base64Data = base64String.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleExtract = async () => {
    if (!file) return;
    setStatus("parsing");
    setError("");

    try {
      const base64Data = await fileToBase64(file);

      // Call API route
      const res = await fetch("/api/import/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfBase64: base64Data,
          fileName: file.name,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed parsing document.");

      setStatus("success");
      onExtractSuccess(responseData.containers, file.name);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed reading DO. Ensure file is readable and Gemini API key is valid.");
      setStatus("failed");
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-indigo-500 bg-indigo-950/20"
            : file
            ? "border-indigo-600/40 bg-indigo-950/5"
            : "border-neutral-800 bg-neutral-950/30 hover:border-neutral-700"
        }`}
      >
        <input
          type="file"
          id="pdf-file-input"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          disabled={status === "parsing"}
        />

        {file ? (
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-950/40 text-indigo-400 border border-indigo-900/60 flex items-center justify-center shadow-lg">
              {status === "parsing" ? (
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ) : (
          <label htmlFor="pdf-file-input" className="w-full h-full cursor-pointer py-4 space-y-3">
            <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center justify-center shadow-lg">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Drag & drop container Delivery Order (PDF)</p>
              <p className="text-xs text-neutral-500 mt-1">or click to browse from local computer</p>
              <p className="text-[10px] text-neutral-600 mt-2">PDF invoices & shipping confirmations supported</p>
            </div>
          </label>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status === "success" && (
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-900/50 p-3 text-xs text-emerald-400 flex items-start space-x-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>PDF scanned successfully! Review extracted container records below.</span>
        </div>
      )}

      {file && status !== "success" && (
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setFile(null);
              setStatus("idle");
            }}
            variant="outline"
            className="flex-1 border-neutral-850 text-neutral-300 hover:bg-neutral-900 cursor-pointer"
            disabled={status === "parsing"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExtract}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white border-0 cursor-pointer"
            disabled={status === "parsing"}
          >
            {status === "parsing" ? "Extracting Containers..." : "Auto-Scan Document"}
          </Button>
        </div>
      )}
    </div>
  );
}
