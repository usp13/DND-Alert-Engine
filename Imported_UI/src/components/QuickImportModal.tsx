import React, { useState, useEffect } from 'react';
import { ContainerItem, ContainerType } from '../types';
import { sampleDischargeDocuments, DischargeListDocument } from '../data/sampleDischargeLists';
import { shippingLineRules } from '../data/shippingLines';
import { calculateLFD, formatDateFull } from '../utils/dndCalculations';
import { detectShippingLineFromPrefix } from '../data/prefixDirectory';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  Ship,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface QuickImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportContainers: (containers: ContainerItem[], docInfo?: { vessel: string; filename: string }) => void;
  defaultDocId?: string;
}

type Step = 'upload' | 'extracting' | 'review' | 'success';

export const QuickImportModal: React.FC<QuickImportModalProps> = ({
  isOpen,
  onClose,
  onImportContainers,
  defaultDocId = 'doc-1',
}) => {
  const [step, setStep] = useState<Step>('upload');
  const [selectedDoc, setSelectedDoc] = useState<DischargeListDocument>(
    sampleDischargeDocuments.find((d) => d.id === defaultDocId) || sampleDischargeDocuments[0]
  );
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStepText, setExtractionStepText] = useState('');
  const [extractedRows, setExtractedRows] = useState<ContainerItem[]>([]);
  const [vesselName, setVesselName] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [portName, setPortName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setExtractionProgress(0);
      setCustomFile(null);
      const defaultItem = sampleDischargeDocuments.find((d) => d.id === defaultDocId) || sampleDischargeDocuments[0];
      setSelectedDoc(defaultItem);
    }
  }, [isOpen, defaultDocId]);

  if (!isOpen) return null;

  const startExtraction = (docToExtract: DischargeListDocument) => {
    setSelectedDoc(docToExtract);
    setVesselName(docToExtract.vesselName);
    setDischargeDate(docToExtract.dischargeDate);
    setPortName(docToExtract.port);
    setStep('extracting');
    setExtractionProgress(10);
    setExtractionStepText('Scanning PDF structure & Indian customs headers...');

    const timer1 = setTimeout(() => {
      setExtractionProgress(35);
      setExtractionStepText(`Identified Vessel: ${docToExtract.vesselName} | Port: ${docToExtract.port} (${docToExtract.terminal})`);
    }, 600);

    const timer2 = setTimeout(() => {
      setExtractionProgress(65);
      setExtractionStepText('Multimodal OCR parsing container numbers & ISO 6346 prefix classification...');
    }, 1200);

    const timer3 = setTimeout(() => {
      setExtractionProgress(90);
      setExtractionStepText('Computing Last Free Days (LFD) across Maersk, MSC, CMA CGM, ONE tariff rules...');
    }, 1800);

    const timer4 = setTimeout(() => {
      setExtractionProgress(100);
      // Map document items into full ContainerItem array
      const mapped: ContainerItem[] = docToExtract.containers.map((c, idx) => ({
        ...c,
        id: `cont-imp-${Date.now()}-${idx}`,
      }));
      setExtractedRows(mapped);
      setStep('review');
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFile(file);

    // Simulate custom PDF based on doc-1 structure with custom name
    const customDoc: DischargeListDocument = {
      ...selectedDoc,
      id: 'custom-' + Date.now(),
      filename: file.name,
      filesize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    };
    startExtraction(customDoc);
  };

  const handleRowChange = (index: number, field: keyof ContainerItem, value: any) => {
    setExtractedRows((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      // If container number changed, auto-update line if prefix changed
      if (field === 'containerNo' && typeof value === 'string' && value.length >= 4) {
        const detected = detectShippingLineFromPrefix(value);
        target.line = detected.line;
      }

      updated[index] = target;
      return updated;
    });
  };

  const handleDeleteRow = (index: number) => {
    setExtractedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBlankRow = () => {
    const defaultDate = dischargeDate || new Date().toISOString().split('T')[0];
    const newCont: ContainerItem = {
      id: `cont-imp-${Date.now()}-${extractedRows.length}`,
      containerNo: 'MSKU' + Math.floor(1000000 + Math.random() * 9000000),
      line: 'Maersk',
      type: '40ft',
      port: portName || 'Kandla',
      dischargeDate: defaultDate,
      importer: 'Gujarat Importer',
      vessel: vesselName || 'MV MAERSK SANA',
      blNumber: `MSKU/KAN/2026/08/${Math.floor(1000 + Math.random() * 9000)}`,
      chaFirm: 'Riddhi Siddhi CHA',
      opsPhone: '+91 98765 43210',
      ownerPhone: '+91 8160024858',
      customsCleared: true,
      truckArranged: false,
      warehouseReady: false,
    };
    setExtractedRows((prev) => [...prev, newCont]);
  };

  const handleConfirmImport = () => {
    if (extractedRows.length === 0) return;
    onImportContainers(extractedRows, { vessel: vesselName, filename: selectedDoc.filename });
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0d1117] border border-[var(--border)] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#161b22] px-6 py-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-white text-base sm:text-lg">
                  WhatsApp PDF Auto-Import Engine
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-mono-data font-extrabold uppercase">
                  Multimodal AI
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] font-medium">
                Extract container numbers, shipping lines, discharge dates, and calculate LFDs automatically from Vessel Discharge Lists & Delivery Orders.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--dim)] hover:text-white p-2 rounded-2xl hover:bg-[var(--card)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: UPLOAD / PICK DOCUMENT */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Dropzone Card */}
              <div className="border-2 border-dashed border-orange-500/30 hover:border-orange-500 bg-[#161b22]/70 rounded-3xl p-8 text-center space-y-4 transition-all relative group cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleCustomFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-base">
                    Drag and drop your Discharge List or Delivery Order PDF
                  </h4>
                  <p className="text-xs text-[var(--muted)] mt-1 font-medium max-w-md mx-auto">
                    Gemini AI will read container tables, detect shipping line prefixes (MSKU, MSCU, ONEY, etc.), and compute free-time deadlines.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-full text-xs font-mono-data text-orange-300 font-bold">
                  <span>Supported: .PDF, .JPG, .PNG up to 25MB</span>
                </div>
              </div>

              {/* Sample PDF Documents Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-data text-orange-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Or choose from sample Indian port discharge lists:
                  </span>
                  <span className="text-[11px] text-[var(--dim)] font-medium">Click to test instant AI parsing</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sampleDischargeDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => startExtraction(doc)}
                      className="bg-[#161b22] hover:bg-[#1f2633] border border-[var(--border)] hover:border-orange-500/50 p-4 rounded-2xl transition-all cursor-pointer space-y-3 group shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono-data text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-extrabold">
                          {doc.totalContainers} Containers
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-orange-400 transition-colors truncate" title={doc.filename}>
                          {doc.filename}
                        </span>
                        <div className="text-[11px] text-[var(--muted)] mt-1 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <Ship className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <strong>{doc.vesselName}</strong> ({doc.voyageNumber})
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            Port: <strong className="text-white">{doc.port}</strong> • {doc.dischargeDate}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono-data text-[var(--dim)]">
                        <span>{doc.filesize} • {doc.pageCount} pages</span>
                        <span className="text-orange-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Parse Now →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EXTRACTING ANIMATION */}
          {step === 'extracting' && (
            <div className="py-12 px-4 text-center space-y-6 max-w-lg mx-auto">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-ping"></div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                  <Bot className="w-10 h-10 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold font-heading text-white">
                  AI Multimodal Extraction in Progress...
                </h4>
                <p className="text-xs text-orange-400 font-mono-data font-semibold">
                  {extractionStepText}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-[var(--panel)] h-3 rounded-full overflow-hidden border border-[var(--border)] p-0.5">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono-data text-[var(--muted)]">
                  <span>Target: {selectedDoc.filename}</span>
                  <span className="font-bold text-white">{extractionProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EDITABLE VERIFICATION TABLE */}
          {step === 'review' && (
            <div className="space-y-4">
              {/* Extracted Metadata Summary Bar */}
              <div className="bg-[#161b22] border border-orange-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-extrabold text-sm">
                        Extracted {extractedRows.length} Containers
                      </span>
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full font-mono-data text-[10px] font-bold">
                        {selectedDoc.filename}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)]">
                      Review or edit extracted values below before confirming addition to your live monitoring dashboard.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddBlankRow}
                  className="bg-[var(--card)] hover:bg-[var(--panel)] border border-[var(--border)] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-400" />
                  <span>Add Row</span>
                </button>
              </div>

              {/* Editable Table */}
              <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[#0d1117] max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#161b22] sticky top-0 z-10 border-b border-[var(--border)] text-[var(--dim)] font-mono-data uppercase text-[10px] tracking-wider font-extrabold">
                    <tr>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Container No.</th>
                      <th className="py-3 px-3">Shipping Line</th>
                      <th className="py-3 px-3">Size</th>
                      <th className="py-3 px-3">Discharge Date</th>
                      <th className="py-3 px-3">LFD (Calculated)</th>
                      <th className="py-3 px-3">Importer</th>
                      <th className="py-3 px-3">Port</th>
                      <th className="py-3 px-2 text-center">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {extractedRows.map((row, idx) => {
                      const lfdDate = calculateLFD(row.dischargeDate, row.line);
                      const lfdFormatted = formatDateFull(lfdDate.toISOString().split('T')[0]);

                      return (
                        <tr key={row.id} className="hover:bg-[#161b22]/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono-data text-[var(--dim)] text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Container No */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.containerNo}
                              onChange={(e) => handleRowChange(idx, 'containerNo', e.target.value.toUpperCase())}
                              className="bg-[#161b22] border border-[var(--border)] focus:border-orange-500 rounded-lg px-2 py-1 font-mono-data text-white font-extrabold uppercase text-xs w-32 outline-none"
                            />
                          </td>

                          {/* Line */}
                          <td className="py-2.5 px-3">
                            <select
                              value={row.line}
                              onChange={(e) => handleRowChange(idx, 'line', e.target.value)}
                              className="bg-[#161b22] border border-[var(--border)] focus:border-orange-500 rounded-lg px-2 py-1 text-xs text-white font-semibold outline-none cursor-pointer"
                            >
                              {shippingLineRules.map((l) => (
                                <option key={l.name} value={l.name}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Size */}
                          <td className="py-2.5 px-3">
                            <select
                              value={row.type}
                              onChange={(e) => handleRowChange(idx, 'type', e.target.value as ContainerType)}
                              className="bg-[#161b22] border border-[var(--border)] rounded-lg px-2 py-1 font-mono-data text-xs text-white font-bold outline-none"
                            >
                              <option value="20ft">20ft</option>
                              <option value="40ft">40ft</option>
                            </select>
                          </td>

                          {/* Discharge Date */}
                          <td className="py-2.5 px-3">
                            <input
                              type="date"
                              value={row.dischargeDate}
                              onChange={(e) => handleRowChange(idx, 'dischargeDate', e.target.value)}
                              className="bg-[#161b22] border border-[var(--border)] rounded-lg px-2 py-1 font-mono-data text-xs text-white outline-none"
                            />
                          </td>

                          {/* Calculated LFD */}
                          <td className="py-2.5 px-3 font-mono-data text-emerald-400 font-bold text-[11px] whitespace-nowrap">
                            📅 {lfdFormatted}
                          </td>

                          {/* Importer */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.importer}
                              onChange={(e) => handleRowChange(idx, 'importer', e.target.value)}
                              className="bg-[#161b22] border border-[var(--border)] focus:border-orange-500 rounded-lg px-2 py-1 text-xs text-white w-40 truncate outline-none font-medium"
                            />
                          </td>

                          {/* Port */}
                          <td className="py-2.5 px-3">
                            <select
                              value={row.port}
                              onChange={(e) => handleRowChange(idx, 'port', e.target.value)}
                              className="bg-[#161b22] border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer"
                            >
                              <option value="Kandla">Kandla</option>
                              <option value="Mundra">Mundra</option>
                              <option value="Nhava Sheva">Nhava Sheva</option>
                              <option value="Chennai">Chennai</option>
                            </select>
                          </td>

                          {/* Delete */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleDeleteRow(idx)}
                              className="text-[var(--dim)] hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remove row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold font-heading text-white">
                ✅ Successfully Added {extractedRows.length} Containers!
              </h4>
              <p className="text-xs text-[var(--muted)]">
                All containers with LFD countdowns and WhatsApp alert triggers have been added to your live dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#161b22] px-6 py-4 border-t border-[var(--border)] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="text-xs text-[var(--muted)] hover:text-white font-bold cursor-pointer"
          >
            Cancel
          </button>

          {step === 'review' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('upload')}
                className="text-xs text-[var(--muted)] hover:text-white px-3 py-2 cursor-pointer font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={extractedRows.length === 0}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-6 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Add All ({extractedRows.length} Containers)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
