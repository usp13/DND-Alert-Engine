import React from 'react';
import { Phone, Globe, MapPin, Building } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-[#060a10] border-t border-[var(--border)] py-6 px-4 lg:px-8 text-xs text-[var(--muted)]">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Left */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span className="font-heading font-black text-white text-sm tracking-wide">
            MAPS Tech & AI
          </span>
          <span className="text-[var(--dim)]">•</span>
          <span className="text-xs font-medium text-[var(--muted)]">D&D Alert Engine v1.0</span>
          <span className="text-[var(--dim)]">•</span>
          <span className="text-[10px] bg-[var(--card)] px-2.5 py-0.5 rounded-full text-orange-400 border border-[var(--border)] font-mono-data font-bold">
            Kandla / Mundra Special
          </span>
        </div>

        {/* Center */}
        <div className="text-xs text-white/80 font-medium">
          Technology Division of <strong className="text-white">MapsUnited Consultancy Pvt. Ltd.</strong> | Founder & MD: <strong className="text-white">Aman Manohar Dana</strong> | Lead Dev: <strong className="text-white">Utsav Panchal</strong>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center md:justify-end gap-3 text-xs font-mono-data text-[var(--muted)]">
          <a
            href="tel:+918160024858"
            className="hover:text-orange-400 transition-colors flex items-center gap-1.5 font-bold"
          >
            <Phone className="w-3.5 h-3.5 text-orange-400" />
            +91 8160024858
          </a>
          <span>•</span>
          <a
            href="https://mapsunitedconsultancy.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-400 transition-colors flex items-center gap-1.5 font-bold"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            mapsunitedconsultancy.in
          </a>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto mt-4 pt-4 border-t border-[var(--border)]/50 text-[11px] text-[var(--dim)] flex flex-col sm:flex-row justify-between items-center gap-2 font-medium">
        <span>Office 211, 2nd Floor, Gurukul City Center, Gandhidham 370201, Kutch, Gujarat, India</span>
        <span>GSTIN: 24AARCM6698J1ZK | Motto: &quot;Mapping Problems. Creating Solutions.&quot;</span>
      </div>
    </footer>
  );
};
