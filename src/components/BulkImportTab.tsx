import React, { useState } from 'react';
import { ContainerItem, ContainerType } from '../types';
import { shippingLineRules } from '../data/shippingLines';
import { detectShippingLineFromPrefix } from '../data/prefixDirectory';
import { calculateLFD, formatDateFull } from '../utils/dndCalculations';
import { sampleDischargeDocuments, DischargeListDocument } from '../data/sampleDischargeLists';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  Ship,
  Calendar,
  Layers,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

interface BulkImportTabProps {
  onAddBulkContainers: (containers: ContainerItem[]) => void;
  onNavigateToWhatsAppBot?: () => void;
}

export const BulkImportTab: React.FC<BulkImportTabProps> = ({
  onAddBulkContainers,
  onNavigateToWhatsAppBot,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'review' | 'saving' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [extractedRows, setExtractedRows] = useState<ContainerItem[]>([]);
  const [vesselName, setVesselName] = useState('MV MAERSK SANA');
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [portName, setPortName] = useState('Kandla');
  const [isDragOver, setIsDragOver] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [importedToast, setImportedToast] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1] || base64String;
        resolve(base64Data);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
    setStatus('parsing');
    setProgressText(`Reading ${uploadedFile.name}...`);

    try {
      const base64Data = await fileToBase64(uploadedFile);
      setProgressText('Parsing container numbers and shipping line rules...');

      const res = await fetch('/api/import/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64Data,
          fileName: uploadedFile.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed parsing document.');
      }

      const rawContainers = data.containers || [];
      if (rawContainers.length === 0) {
        throw new Error('No 11-character container numbers detected. You can add them manually below.');
      }

      const inferredVessel = rawContainers[0]?.vessel_name || uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      const inferredPort = rawContainers[0]?.port || 'Kandla';
      const inferredDischarge = rawContainers[0]?.discharge_date || new Date().toISOString().split('T')[0];

      setVesselName(inferredVessel);
      setPortName(inferredPort);
      setDischargeDate(inferredDischarge);

      const mapped: ContainerItem[] = rawContainers.map((c: any, idx: number) => {
        const lineInfo = detectShippingLineFromPrefix(c.container_number || c.containerNo || '');
        return {
          id: `cont-imp-${Date.now()}-${idx}`,
          containerNo: (c.container_number || c.containerNo || '').toUpperCase(),
          line: c.shipping_line || lineInfo.line || 'Maersk',
          type: (c.container_type || '40ft') as ContainerType,
          port: c.port || inferredPort,
          dischargeDate: c.discharge_date || inferredDischarge,
          importer: 'Direct Importer',
          vessel: c.vessel_name || inferredVessel,
          blNumber: c.bl_number || c.booking_number || `BL-${(c.container_number || '').slice(4)}`,
          chaFirm: 'Riddhi Siddhi CHA',
          opsPhone: '+91 98765 43210',
          ownerPhone: '+91 8160024858',
          customsCleared: true,
          truckArranged: false,
          warehouseReady: false,
        };
      });

      setExtractedRows(mapped);
      setStatus('review');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed parsing document.');
      setStatus('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadSamplePreset = (doc: DischargeListDocument) => {
    setFile(null);
    setError(null);
    setVesselName(doc.vesselName);
    setDischargeDate(doc.dischargeDate);
    setPortName(doc.port);
    const mapped: ContainerItem[] = doc.containers.map((c, idx) => ({
      ...c,
      id: `cont-preset-${Date.now()}-${idx}`,
    }));
    setExtractedRows(mapped);
    setStatus('review');
  };

  const handleRowChange = (index: number, field: keyof ContainerItem, value: any) => {
    setExtractedRows((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

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
      id: `cont-manual-${Date.now()}-${extractedRows.length}`,
      containerNo: 'MSKU' + Math.floor(1000000 + Math.random() * 9000000),
      line: 'Maersk',
      type: '40ft',
      port: portName || 'Kandla',
      dischargeDate: defaultDate,
      importer: 'Direct Importer',
      vessel: vesselName || 'Cargo Vessel',
      blNumber: `BL-${Math.floor(1000 + Math.random() * 9000)}`,
      chaFirm: 'Riddhi Siddhi CHA',
      opsPhone: '+91 98765 43210',
      ownerPhone: '+91 8160024858',
      customsCleared: true,
      truckArranged: false,
      warehouseReady: false,
    };
    setExtractedRows((prev) => [...prev, newCont]);
  };

  const handleConfirmSave = () => {
    if (extractedRows.length === 0) return;
    
    let userEmail = '';
    let firmName = '';
    let ownerPhone = '';
    if (typeof window !== 'undefined') {
      try {
        const session = JSON.parse(localStorage.getItem('dnd_user_session') || '{}');
        userEmail = session.email || '';
        firmName = session.firmName || '';
        ownerPhone = session.mobile || '';
      } catch (_) {}
    }

    const scopedRows = extractedRows.map((c) => ({
      ...c,
      chaFirm: firmName || c.chaFirm,
    }));

    onAddBulkContainers(scopedRows);

    if (typeof window !== 'undefined' && userEmail) {
      try {
        const existing = JSON.parse(localStorage.getItem(`dnd_containers_${userEmail}`) || '[]');
        const updated = [...scopedRows, ...existing.filter((e: any) => !scopedRows.some((s) => s.containerNo === e.containerNo))];
        localStorage.setItem(`dnd_containers_${userEmail}`, JSON.stringify(updated));
      } catch (_) {}
    }

    // Save each container to backend in background
    scopedRows.forEach((c) => {
      fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          container_number: c.containerNo,
          shipping_line: c.line,
          container_type: c.type,
          port: c.port,
          discharge_date: c.dischargeDate,
          importer_name: c.importer,
          importer_phone: c.opsPhone,
          vessel_name: c.vessel,
          bl_number: c.blNumber,
          demurrage_free_days: 14,
          status: 'active',
          user_email: userEmail || undefined,
          firm_name: firmName || undefined,
          owner_phone: ownerPhone || undefined,
        }),
      }).catch((err) => console.error('Failed saving bulk container:', err));
    });

    setImportedToast(`✅ ${extractedRows.length} containers successfully imported to Live Dashboard!`);
    setStatus('idle');
    setExtractedRows([]);
    setFile(null);
    setTimeout(() => setImportedToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {importedToast && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{importedToast}</span>
          </div>
          <button
            onClick={() => setImportedToast(null)}
            className="text-[var(--muted)] hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[var(--border)] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-orange-500/20">
                📄 Direct PDF & DO Import
              </span>
              <span className="px-3 py-0.5 bg-sky-500/10 text-sky-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-sky-500/20">
                Fast Live OCR
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
              Drag & Drop Delivery Order PDFs
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-medium">
              Upload electronic Delivery Orders, booking confirmations, or discharge lists. The system automatically reads container tables, detects ISO prefixes, calculates LFDs, and syncs to your live dashboard.
            </p>
          </div>

          {onNavigateToWhatsAppBot && (
            <button
              onClick={onNavigateToWhatsAppBot}
              className="bg-[#005c4b] hover:bg-[#00705a] text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 border border-emerald-500/30 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>Forward via WhatsApp Bot (+91 8160024858) →</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-2xl flex items-center gap-3 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropzone Area */}
      {status === 'idle' && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 text-center space-y-4 transition-all relative group cursor-pointer ${
              isDragOver
                ? 'border-orange-500 bg-orange-950/20'
                : 'border-[var(--border)] hover:border-orange-500/60 bg-[#161b22]/70'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-lg">
                Drag and drop your Delivery Order (PDF)
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1 font-medium max-w-md mx-auto">
                Extract container numbers, shipping lines, discharge dates, and calculate LFD schedules in seconds.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-full text-xs font-mono-data text-orange-300 font-bold">
              <span>Supported: .PDF, .JPG, .PNG up to 25MB</span>
            </div>
          </div>

          {/* Sample Indian Port Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data text-orange-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Or load sample Indian Port Discharge Presets:
              </span>
              <span className="text-[11px] text-[var(--dim)] font-medium">1-Click Test Data</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sampleDischargeDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => loadSamplePreset(doc)}
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
                      Load Preset →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Parsing Spinner */}
      {status === 'parsing' && (
        <div className="py-16 text-center space-y-4 bg-[#161b22]/50 border border-[var(--border)] rounded-3xl">
          <Loader2 className="w-10 h-10 text-orange-400 animate-spin mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">Extracting Container Records...</h3>
            <p className="text-xs text-orange-400 font-mono-data mt-1">{progressText}</p>
          </div>
        </div>
      )}

      {/* Review & Editable Table */}
      {status === 'review' && (
        <div className="space-y-4">
          <div className="bg-[#161b22] border border-[var(--border)] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-extrabold text-sm sm:text-base">
                    Extracted {extractedRows.length} Container Records
                  </span>
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full font-mono-data text-[10px] font-bold">
                    {file?.name || 'Discharge List'}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Verify or edit container details below before confirming.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatus('idle')}
                className="bg-[var(--card)] hover:bg-[#1f2633] text-[var(--muted)] hover:text-white border border-[var(--border)] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Upload Different File
              </button>
              <button
                onClick={handleAddBlankRow}
                className="bg-[var(--card)] hover:bg-[#1f2633] text-white border border-[var(--border)] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-orange-400" />
                <span>Add Row</span>
              </button>
              <button
                onClick={handleConfirmSave}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Add All ({extractedRows.length} Containers) to Live Dashboard</span>
              </button>
            </div>
          </div>

          <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[#0d1117]">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#161b22] sticky top-0 z-10 border-b border-[var(--border)] text-[var(--dim)] font-mono-data uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Container No.</th>
                    <th className="py-3 px-3">Shipping Line</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Discharge Date</th>
                    <th className="py-3 px-3">Calculated LFD</th>
                    <th className="py-3 px-3">Importer</th>
                    <th className="py-3 px-3">Port</th>
                    <th className="py-3 px-2 text-center">Action</th>
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
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={row.containerNo}
                            onChange={(e) => handleRowChange(idx, 'containerNo', e.target.value.toUpperCase())}
                            className="bg-[#161b22] border border-[var(--border)] focus:border-orange-500 rounded-lg px-2.5 py-1.5 font-mono-data text-white font-extrabold uppercase text-xs w-36 outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.line}
                            onChange={(e) => handleRowChange(idx, 'line', e.target.value)}
                            className="bg-[#161b22] border border-[var(--border)] focus:border-orange-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold outline-none cursor-pointer"
                          >
                            {shippingLineRules.map((l) => (
                              <option key={l.name} value={l.name}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.type}
                            onChange={(e) => handleRowChange(idx, 'type', e.target.value as ContainerType)}
                            className="bg-[#161b22] border border-[var(--border)] rounded-lg px-2.5 py-1.5 font-mono-data text-xs text-white font-bold outline-none cursor-pointer"
                          >
                            <option value="20ft">20ft</option>
                            <option value="40ft">40ft</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="date"
                            value={row.dischargeDate}
                            onChange={(e) => handleRowChange(idx, 'dischargeDate', e.target.value)}
                            className="bg-[#161b22] border border-[var(--border)] rounded-lg px-2 py-1.5 font-mono-data text-xs text-white outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono-data text-emerald-400 font-bold text-[11px] whitespace-nowrap">
                          📅 {lfdFormatted}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={row.importer}
                            onChange={(e) => handleRowChange(idx, 'importer', e.target.value)}
                            className="bg-[#161b22] border border-[var(--border)] focus:border-orange-500 rounded-lg px-2.5 py-1.5 text-xs text-white w-36 truncate outline-none font-medium"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.port}
                            onChange={(e) => handleRowChange(idx, 'port', e.target.value)}
                            className="bg-[#161b22] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="Kandla">Kandla</option>
                            <option value="Mundra">Mundra</option>
                            <option value="Nhava Sheva">Nhava Sheva</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Hazira">Hazira</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(idx)}
                            className="text-[var(--dim)] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
