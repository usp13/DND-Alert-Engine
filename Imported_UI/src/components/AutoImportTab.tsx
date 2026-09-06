import React, { useState } from 'react';
import {
  MessageSquare,
  FileText,
  CheckCheck,
  Sparkles,
  Bot,
  Send,
  Upload,
  Search,
  Check,
  Layers,
  ArrowRight,
  ShieldCheck,
  Ship,
  Calendar,
  Phone,
  Clock,
  ExternalLink,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ContainerItem } from '../types';
import { sampleDischargeDocuments, samplePastImportHistory, DischargeListDocument } from '../data/sampleDischargeLists';
import { containerPrefixDirectory, detectShippingLineFromPrefix } from '../data/prefixDirectory';
import { calculateLFD, formatDateFull } from '../utils/dndCalculations';

interface AutoImportTabProps {
  onAddBulkContainers: (containers: ContainerItem[]) => void;
  onOpenQuickModal: (docId?: string) => void;
}

export const AutoImportTab: React.FC<AutoImportTabProps> = ({
  onAddBulkContainers,
  onOpenQuickModal,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-1');
  const [chatAnimationStep, setChatAnimationStep] = useState<number>(3); // 0: sending, 1: bot parsing, 2: bot found, 3: bot confirmation summary
  const [importedToast, setImportedToast] = useState<string | null>(null);

  // Prefix Directory Search & Test
  const [prefixSearch, setPrefixSearch] = useState('');
  const [testContainerInput, setTestContainerInput] = useState('MSKU7284931');

  const currentDoc = sampleDischargeDocuments.find((d) => d.id === selectedDocId) || sampleDischargeDocuments[0];

  const handleSwitchDoc = (docId: string) => {
    setSelectedDocId(docId);
    setChatAnimationStep(0);
    setTimeout(() => setChatAnimationStep(1), 600);
    setTimeout(() => setChatAnimationStep(2), 1400);
    setTimeout(() => setChatAnimationStep(3), 2200);
  };

  const handleImportToDashboard = () => {
    const mapped: ContainerItem[] = currentDoc.containers.map((c, idx) => ({
      ...c,
      id: `cont-auto-${Date.now()}-${idx}`,
    }));
    onAddBulkContainers(mapped);
    setImportedToast(`✅ ${mapped.length} containers from ${currentDoc.vesselName} successfully added to Live Dashboard!`);
    setTimeout(() => setImportedToast(null), 5000);
  };

  const detectedLineForInput = detectShippingLineFromPrefix(testContainerInput);

  const filteredPrefixes = containerPrefixDirectory.filter((p) => {
    const q = prefixSearch.toLowerCase();
    return (
      p.prefix.toLowerCase().includes(q) ||
      p.line.toLowerCase().includes(q) ||
      p.fullName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {importedToast && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCheck className="w-5 h-5 text-emerald-400 shrink-0" />
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

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[var(--border)] p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-orange-500/20">
                ✨ WhatsApp PDF Auto-Import
              </span>
              <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-emerald-500/20">
                Gemini Multimodal AI
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
              Forward PDF to WhatsApp. Auto-Extract Everything.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-medium">
              No manual typing required. Forward any Vessel Discharge List or Delivery Order PDF to our WhatsApp Business Bot (<strong className="text-white font-mono-data">+91 8160024858</strong>). Our multimodal AI identifies container numbers, matches shipping lines via ISO prefixes, and schedules LFD countdowns in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenQuickModal(selectedDocId)}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Quick Upload PDF</span>
            </button>
            <a
              href="https://wa.me/918160024858?text=Hi%20MAPS%20AI%2C%20I%20am%20sharing%20a%20vessel%20discharge%20list%20PDF%20to%20auto-import%20containers."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#005c4b] hover:bg-[#00705a] text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 border border-emerald-500/30 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>Chat +91 8160024858</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4-Step How It Works Interactive Flow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black font-heading text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            How WhatsApp PDF Auto-Import Works
          </h3>
          <span className="text-xs font-mono-data text-[var(--muted)]">4-Step Automation Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-5 rounded-3xl border border-[var(--border)] transition-all space-y-3 shadow-md group">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm font-mono-data group-hover:scale-110 transition-transform">
              01
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Forward PDF on WhatsApp
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                Forward any Vessel Discharge List or Delivery Order PDF to <strong className="text-white font-mono-data">+91 8160024858</strong> on WhatsApp.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-5 rounded-3xl border border-[var(--border)] transition-all space-y-3 shadow-md group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono-data group-hover:scale-110 transition-transform">
              02
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                AI Multimodal Extraction
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                Gemini AI extracts container numbers, shipping lines (MSKU, MSCU, ONEY), vessel name, and discharge dates automatically.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-5 rounded-3xl border border-[var(--border)] transition-all space-y-3 shadow-md group">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm font-mono-data group-hover:scale-110 transition-transform">
              03
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Instant Dashboard Addition
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                All containers appear on your live dashboard with pre-calculated Last Free Day (LFD) countdowns and line tariffs.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-5 rounded-3xl border border-[var(--border)] transition-all space-y-3 shadow-md group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm font-mono-data group-hover:scale-110 transition-transform">
              04
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Automated LFD Alerts
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                Sit back — WhatsApp alerts trigger automatically at 72h, 48h, 24h, and overdue stages to all configured stakeholder numbers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: WhatsApp Chat Simulator + Live Document Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Selector & Live Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <h3 className="font-heading font-black text-white text-sm">
                  Select Document to Simulate
                </h3>
              </div>
              <span className="text-[10px] font-mono-data text-[var(--dim)]">
                Sample Indian Discharges
              </span>
            </div>

            <div className="space-y-2.5">
              {sampleDischargeDocuments.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSwitchDoc(doc.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#161b22] border-orange-500 shadow-md shadow-orange-500/10'
                        : 'bg-[var(--panel)] border-[var(--border)] hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'bg-[var(--card)] text-[var(--muted)]'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[180px]">
                          {doc.filename}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-data bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold">
                        {doc.totalContainers} Containers
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--muted)] pt-1">
                      <div>
                        <span className="text-[10px] text-[var(--dim)] block uppercase font-bold">Vessel & Voyage</span>
                        <strong className="text-white font-medium">{doc.vesselName} ({doc.voyageNumber})</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--dim)] block uppercase font-bold">Port & Date</span>
                        <strong className="text-white font-medium">{doc.port} • {doc.dischargeDate}</strong>
                      </div>
                    </div>

                    {/* Breakdown pill tags */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-[var(--border)]/60 text-[10px] font-mono-data">
                      {Object.entries(doc.lineBreakdown).map(([line, count]) => (
                        <span
                          key={line}
                          className="px-2 py-0.5 bg-[var(--card)] rounded-md text-[var(--muted)] border border-[var(--border)]"
                        >
                          {line}: <strong className="text-white">{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick action button */}
            <div className="pt-2">
              <button
                onClick={() => onOpenQuickModal(selectedDocId)}
                className="w-full bg-[var(--panel)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-white font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>Open in Full Interactive Table Editor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Simulated WhatsApp Chat Interface (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-[#0b141a] rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col h-full min-h-[520px]">
            {/* WhatsApp Top Header Bar */}
            <div className="bg-[#1f2c34] px-5 py-3.5 flex items-center justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                    M
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1f2c34]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      MAPS D&D Alert Bot
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-mono-data border border-emerald-500/30">
                      Official AI
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono-data block">
                    Online • +91 8160024858 • Gandhidham
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSwitchDoc(selectedDocId)}
                  className="bg-[#111b21] hover:bg-black/40 text-[var(--muted)] hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-mono-data flex items-center gap-1 border border-white/5 transition-all cursor-pointer"
                  title="Re-run animation"
                >
                  <RotateCcw className="w-3 h-3 text-orange-400" />
                  <span className="hidden sm:inline">Re-play</span>
                </button>
              </div>
            </div>

            {/* Chat Bubble Area with WhatsApp Pattern */}
            <div className="p-4 sm:p-6 space-y-4 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] flex-1 overflow-y-auto">
              {/* Encryption Notice */}
              <div className="text-center">
                <span className="bg-[#182229] text-[10px] font-mono-data text-amber-300/80 px-3 py-1 rounded-lg border border-amber-500/15 inline-block">
                  🔒 Messages and PDF documents are processed securely via MAPS AI Engine
                </span>
              </div>

              {/* 1. Outgoing Message: User forwards PDF */}
              <div className="flex justify-end animate-fade-in">
                <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none max-w-sm sm:max-w-md shadow-md space-y-2 border border-emerald-600/30">
                  {/* PDF attachment card */}
                  <div className="bg-[#024a3c] p-2.5 rounded-xl flex items-center gap-3 border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white block truncate" title={currentDoc.filename}>
                        {currentDoc.filename}
                      </span>
                      <span className="text-[10px] text-emerald-200/80 font-mono-data block">
                        {currentDoc.filesize} • {currentDoc.pageCount} pages • Indian Customs Format
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-white/90">
                    Forwarding vessel discharge list for <strong className="text-emerald-200">{currentDoc.vesselName}</strong>. Please auto-import containers.
                  </p>

                  <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200 font-mono-data pt-0.5">
                    <span>10:41 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                </div>
              </div>

              {/* 2. Bot Reply: Processing */}
              {chatAnimationStep >= 1 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-[#1f2c34] text-white p-3 rounded-2xl rounded-tl-none max-w-xs sm:max-w-sm shadow-md text-xs font-mono-data space-y-1 border border-white/5">
                    <div className="flex items-center gap-2 text-orange-400 font-bold">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                      <span>📄 Processing your discharge list...</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)]">
                      Scanning <strong className="text-white">{currentDoc.vesselName}</strong> discharge log for {currentDoc.port} Port.
                    </p>
                    <div className="text-right text-[9px] text-[var(--dim)] pt-0.5">10:41 AM</div>
                  </div>
                </div>
              )}

              {/* 3. Bot Reply: Found & Calculating */}
              {chatAnimationStep >= 2 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-[#1f2c34] text-white p-3 rounded-2xl rounded-tl-none max-w-xs sm:max-w-sm shadow-md text-xs font-mono-data space-y-1 border border-white/5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>✅ Found {currentDoc.totalContainers} containers. Importing...</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)]">
                      Prefix recognition matched {Object.keys(currentDoc.lineBreakdown).length} lines. Calculating LFDs...
                    </p>
                    <div className="text-right text-[9px] text-[var(--dim)] pt-0.5">10:41 AM</div>
                  </div>
                </div>
              )}

              {/* 4. Bot Reply: Final Confirmation Summary Card with Table */}
              {chatAnimationStep >= 3 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-[#1f2c34] text-white p-4 rounded-3xl rounded-tl-none max-w-lg shadow-2xl text-xs space-y-3 border border-emerald-500/40">
                    {/* Confirmation Header */}
                    <div className="border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span>✅ {currentDoc.totalContainers} containers imported from {currentDoc.vesselName} discharge list.</span>
                      </div>
                      <div className="text-xs text-amber-300 font-mono-data font-semibold">
                        {Object.entries(currentDoc.lineBreakdown)
                          .map(([line, count]) => `${count} ${line}`)
                          .join(', ')}. All LFDs calculated.
                      </div>
                    </div>

                    {/* Metadata specs */}
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono-data">
                      <div>
                        <span className="text-[var(--dim)] block text-[10px]">Vessel & Port</span>
                        <strong className="text-white">{currentDoc.vesselName} • {currentDoc.port}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--dim)] block text-[10px]">Discharge Date</span>
                        <strong className="text-emerald-300">{currentDoc.dischargeDate}</strong>
                      </div>
                    </div>

                    {/* Table of extracted containers */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono-data text-[var(--muted)] uppercase font-bold block">
                        Extracted Containers Sample Preview:
                      </span>
                      <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-[11px] font-mono-data">
                          <thead className="bg-[#111b21] text-[var(--dim)] text-[10px] uppercase border-b border-white/5">
                            <tr>
                              <th className="py-2 px-2.5">Container #</th>
                              <th className="py-2 px-2">Line</th>
                              <th className="py-2 px-2">Size</th>
                              <th className="py-2 px-2.5">Calculated LFD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {currentDoc.containers.slice(0, 6).map((c, i) => {
                              const lfd = calculateLFD(c.dischargeDate, c.line);
                              const lfdStr = formatDateFull(lfd.toISOString().split('T')[0]);
                              return (
                                <tr key={i} className="hover:bg-white/5">
                                  <td className="py-1.5 px-2.5 font-bold text-white">{c.containerNo}</td>
                                  <td className="py-1.5 px-2 text-orange-300">{c.line}</td>
                                  <td className="py-1.5 px-2 text-[var(--muted)]">{c.type}</td>
                                  <td className="py-1.5 px-2.5 text-emerald-400 font-bold">{lfdStr}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {currentDoc.containers.length > 6 && (
                        <span className="text-[10px] text-[var(--dim)] font-mono-data block text-right">
                          + {currentDoc.containers.length - 6} more containers in batch
                        </span>
                      )}
                    </div>

                    {/* Action Bar inside WhatsApp bubble */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={handleImportToDashboard}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add All ({currentDoc.totalContainers}) to Live Dashboard</span>
                      </button>

                      <span className="text-[9px] text-[var(--dim)] font-mono-data">
                        10:42 AM
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Simulated Input Bar */}
            <div className="bg-[#1f2c34] p-3 border-t border-white/5 flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenQuickModal(selectedDocId)}
                className="text-[var(--muted)] hover:text-white p-2 rounded-xl hover:bg-black/30 transition-colors cursor-pointer"
                title="Attach PDF file"
              >
                <Upload className="w-4 h-4 text-orange-400" />
              </button>
              <div className="flex-1 bg-[#2a3942] rounded-2xl px-4 py-2 text-xs text-white placeholder-[var(--dim)] outline-none font-mono-data flex items-center justify-between">
                <span className="text-[var(--muted)]">Send PDF via WhatsApp to +91 8160024858...</span>
                <span className="text-[10px] text-orange-400 font-bold">Bot Ready</span>
              </div>
              <button
                onClick={() => handleSwitchDoc(selectedDocId)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2 rounded-full cursor-pointer transition-all"
                title="Simulate Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import History Log Bento Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-base">
                Import History & Processing Log
              </h3>
              <p className="text-xs text-[var(--muted)] font-medium">
                Audit trail of all PDFs forwarded via WhatsApp or uploaded via Quick Import.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono-data text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-extrabold">
            4 Past Batches Logged
          </span>
        </div>

        <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--panel)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-[#161b22] border-b border-[var(--border)] text-[var(--dim)] font-mono-data uppercase text-[10px] tracking-wider font-extrabold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Document / Filename</th>
                  <th className="py-3 px-4">Vessel & Port</th>
                  <th className="py-3 px-4 text-center">Containers</th>
                  <th className="py-3 px-4">Lines Breakdown</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {samplePastImportHistory.map((hist) => (
                  <tr key={hist.id} className="hover:bg-[var(--card)] transition-colors">
                    <td className="py-3 px-4 font-mono-data text-[var(--muted)] text-[11px] whitespace-nowrap">
                      {hist.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="truncate max-w-[200px]" title={hist.filename}>
                          {hist.filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {hist.vessel} ({hist.port})
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data font-black text-emerald-400">
                      {hist.containersCount}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[var(--muted)] font-mono-data">
                      {hist.lines}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-[11px]">
                      <span className="px-2.5 py-0.5 bg-[#005c4b]/30 text-emerald-300 rounded-full border border-emerald-500/20">
                        {hist.botChannel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data text-[10px]">
                      <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/30 font-extrabold">
                        ✓ {hist.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenQuickModal(selectedDocId)}
                        className="text-orange-400 hover:text-orange-300 text-xs font-bold hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Container Prefix Directory Reference Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-base sm:text-lg">
                Container Prefix Directory (ISO 6346)
              </h3>
              <p className="text-xs text-[var(--muted)] font-medium">
                Auto-detection database mapping 4-letter container prefix to shipping line and Indian port free-time rules.
              </p>
            </div>
          </div>

          {/* Quick interactive test input */}
          <div className="flex items-center gap-2 bg-[var(--panel)] border border-[var(--border)] px-3 py-1.5 rounded-2xl">
            <span className="text-[10px] font-mono-data text-orange-400 font-extrabold uppercase">
              Test Prefix:
            </span>
            <input
              type="text"
              value={testContainerInput}
              onChange={(e) => setTestContainerInput(e.target.value.toUpperCase())}
              placeholder="e.g. MSKU7284931"
              maxLength={11}
              className="bg-transparent text-xs font-mono-data text-white font-extrabold outline-none uppercase w-28"
            />
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-mono-data font-bold border border-emerald-500/30">
              → {detectedLineForInput.line} ({detectedLineForInput.freeDays}d free)
            </span>
          </div>
        </div>

        {/* Search prefix */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--dim)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={prefixSearch}
              onChange={(e) => setPrefixSearch(e.target.value)}
              placeholder="Search prefix (MSKU, MSCU, ONEY, etc.)..."
              className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[var(--dim)] outline-none"
            />
          </div>
          <span className="text-xs font-mono-data text-[var(--muted)]">
            Showing {filteredPrefixes.length} recognized shipping line prefixes
          </span>
        </div>

        {/* Prefix Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPrefixes.map((p) => (
            <div
              key={p.prefix}
              className="bg-[var(--panel)] hover:bg-[#161b22] border border-[var(--border)] hover:border-orange-500/40 p-4 rounded-2xl transition-all space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-data font-black text-sm text-white bg-[var(--card)] px-3 py-1 rounded-xl border border-[var(--border)] group-hover:border-orange-500/40 group-hover:text-orange-400 transition-colors">
                  {p.prefix}
                </span>
                <span className="text-xs font-extrabold text-orange-400 font-heading">
                  {p.line}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-white block truncate" title={p.fullName}>
                  {p.fullName}
                </span>
                <p className="text-[11px] text-[var(--muted)] mt-1 font-medium line-clamp-2">
                  {p.notes}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono-data">
                <span className="text-emerald-400 font-bold">
                  {p.standardFreeDays} Free Days
                </span>
                <span className="text-[var(--dim)]">
                  {p.model} Model • {p.country}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
