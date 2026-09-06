export interface PrefixEntry {
  prefix: string;
  line: string;
  fullName: string;
  country: string;
  standardFreeDays: number;
  model: 'Split' | 'Merged';
  color: string;
  notes: string;
}

export const containerPrefixDirectory: PrefixEntry[] = [
  {
    prefix: 'MSKU',
    line: 'Maersk',
    fullName: 'Maersk Line / A.P. Moller–Maersk',
    country: 'Denmark',
    standardFreeDays: 7,
    model: 'Split',
    color: '#00243d',
    notes: 'Standard 7 free days at Kandla & Mundra. 40ft rate starts at ₹7,000/day.',
  },
  {
    prefix: 'MAEU',
    line: 'Maersk',
    fullName: 'Maersk Line Inbound (Legacy APM)',
    country: 'Denmark',
    standardFreeDays: 7,
    model: 'Split',
    color: '#00243d',
    notes: 'Covers Maersk / Safmarine legacy units.',
  },
  {
    prefix: 'MRKU',
    line: 'Maersk',
    fullName: 'Maersk Sealand / MCC',
    country: 'Denmark',
    standardFreeDays: 7,
    model: 'Split',
    color: '#00243d',
    notes: 'Intra-Asia and European Maersk services.',
  },
  {
    prefix: 'MSCU',
    line: 'MSC',
    fullName: 'Mediterranean Shipping Company',
    country: 'Switzerland',
    standardFreeDays: 5,
    model: 'Split',
    color: '#fcb900',
    notes: 'Strict 5 free days demurrage. Daily charges begin on Day 6.',
  },
  {
    prefix: 'MEDU',
    line: 'MSC',
    fullName: 'MSC Mediterranean Services',
    country: 'Switzerland',
    standardFreeDays: 5,
    model: 'Split',
    color: '#fcb900',
    notes: 'High Cube and Special equipment prefixes.',
  },
  {
    prefix: 'CMAU',
    line: 'CMA CGM',
    fullName: 'Compagnie Maritime d’Affrètement',
    country: 'France',
    standardFreeDays: 10,
    model: 'Merged',
    color: '#002b66',
    notes: 'Merged 10 calendar days combined demurrage + detention.',
  },
  {
    prefix: 'CGMU',
    line: 'CMA CGM',
    fullName: 'CMA CGM France Global',
    country: 'France',
    standardFreeDays: 10,
    model: 'Merged',
    color: '#002b66',
    notes: 'Direct Europe/Middle East service calls.',
  },
  {
    prefix: 'ANLU',
    line: 'CMA CGM',
    fullName: 'ANL Container Line (CMA CGM Group)',
    country: 'Australia / France',
    standardFreeDays: 10,
    model: 'Merged',
    color: '#002b66',
    notes: 'Follows CMA CGM India merged tariff rules.',
  },
  {
    prefix: 'HLBU',
    line: 'Hapag-Lloyd',
    fullName: 'Hapag-Lloyd AG',
    country: 'Germany',
    standardFreeDays: 7,
    model: 'Split',
    color: '#ff6600',
    notes: 'Standard 7 free days. Detention starts after gate-out.',
  },
  {
    prefix: 'HLCU',
    line: 'Hapag-Lloyd',
    fullName: 'Hapag-Lloyd Container Group',
    country: 'Germany',
    standardFreeDays: 7,
    model: 'Split',
    color: '#ff6600',
    notes: 'Middle East & Gulf feeder connections.',
  },
  {
    prefix: 'ONEY',
    line: 'ONE',
    fullName: 'Ocean Network Express (MOL/NYK/K-Line)',
    country: 'Japan / Singapore',
    standardFreeDays: 7,
    model: 'Split',
    color: '#ff1493',
    notes: 'Magenta units. ₹6,000/day tier 1 after 7 free days for 40ft.',
  },
  {
    prefix: 'TGHU',
    line: 'ONE',
    fullName: 'ONE / Textainer Leased',
    country: 'Japan',
    standardFreeDays: 7,
    model: 'Split',
    color: '#ff1493',
    notes: 'Common ONE leased fleet at Kandla/Mundra.',
  },
  {
    prefix: 'EGSU',
    line: 'Evergreen',
    fullName: 'Evergreen Marine Corporation',
    country: 'Taiwan',
    standardFreeDays: 7,
    model: 'Split',
    color: '#007a3d',
    notes: '7 calendar days free. ₹5,000/day for 40ft in first slab.',
  },
  {
    prefix: 'EISU',
    line: 'Evergreen',
    fullName: 'Evergreen International Storage',
    country: 'Taiwan',
    standardFreeDays: 7,
    model: 'Split',
    color: '#007a3d',
    notes: 'Standard dry van equipment.',
  },
  {
    prefix: 'CCLU',
    line: 'COSCO',
    fullName: 'COSCO Shipping Lines / China Container Line',
    country: 'China',
    standardFreeDays: 7,
    model: 'Split',
    color: '#004b87',
    notes: 'Direct calls at Mundra and Nhava Sheva.',
  },
  {
    prefix: 'OOLU',
    line: 'COSCO',
    fullName: 'OOCL (Orient Overseas Container Line - COSCO Group)',
    country: 'Hong Kong / China',
    standardFreeDays: 7,
    model: 'Split',
    color: '#e60012',
    notes: 'Dual branded fleet under COSCO shipping alliance.',
  },
  {
    prefix: 'COSU',
    line: 'COSCO',
    fullName: 'COSCO Inbound Container Fleet',
    country: 'China',
    standardFreeDays: 7,
    model: 'Split',
    color: '#004b87',
    notes: 'Far East - India Direct (FIDC) service.',
  },
  {
    prefix: 'YMLU',
    line: 'Yang Ming',
    fullName: 'Yang Ming Marine Transport Corp',
    country: 'Taiwan',
    standardFreeDays: 7,
    model: 'Split',
    color: '#003366',
    notes: '7 calendar days free. Slabs start at ₹5,000/day.',
  },
  {
    prefix: 'HDMU',
    line: 'HMM',
    fullName: 'HMM Co., Ltd. (Hyundai Merchant Marine)',
    country: 'South Korea',
    standardFreeDays: 5,
    model: 'Split',
    color: '#8b0000',
    notes: '5 free days standard at West Coast India ports.',
  },
  {
    prefix: 'HMMU',
    line: 'HMM',
    fullName: 'HMM Global Fleet',
    country: 'South Korea',
    standardFreeDays: 5,
    model: 'Split',
    color: '#8b0000',
    notes: 'Direct Asia-India services.',
  },
  {
    prefix: 'ZIMU',
    line: 'ZIM',
    fullName: 'ZIM Integrated Shipping Services',
    country: 'Israel',
    standardFreeDays: 7,
    model: 'Split',
    color: '#d4af37',
    notes: '7 calendar days free. ZIM India Med Express.',
  },
  {
    prefix: 'ZCSU',
    line: 'ZIM',
    fullName: 'ZIM Container Service',
    country: 'Israel',
    standardFreeDays: 7,
    model: 'Split',
    color: '#d4af37',
    notes: 'High cube and refrigerated units.',
  },
];

/**
 * Identifies shipping line name from a container number prefix (first 4 letters)
 */
export function detectShippingLineFromPrefix(containerNo: string): {
  line: string;
  matchedPrefix: string;
  freeDays: number;
  model: 'Split' | 'Merged';
  confidence: number;
} {
  if (!containerNo || containerNo.length < 4) {
    return { line: 'Maersk', matchedPrefix: 'MSKU', freeDays: 7, model: 'Split', confidence: 0 };
  }

  const clean = containerNo.trim().toUpperCase();
  const prefix4 = clean.slice(0, 4);

  const matched = containerPrefixDirectory.find((p) => p.prefix === prefix4);
  if (matched) {
    return {
      line: matched.line,
      matchedPrefix: matched.prefix,
      freeDays: matched.standardFreeDays,
      model: matched.model,
      confidence: 1.0,
    };
  }

  // Fallbacks on 3-letter matching if 4th is standard 'U'
  if (clean.startsWith('MSK')) return { line: 'Maersk', matchedPrefix: 'MSKU', freeDays: 7, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('MSC')) return { line: 'MSC', matchedPrefix: 'MSCU', freeDays: 5, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('CMA')) return { line: 'CMA CGM', matchedPrefix: 'CMAU', freeDays: 10, model: 'Merged', confidence: 0.9 };
  if (clean.startsWith('HLB') || clean.startsWith('HLC')) return { line: 'Hapag-Lloyd', matchedPrefix: 'HLBU', freeDays: 7, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('ONE')) return { line: 'ONE', matchedPrefix: 'ONEY', freeDays: 7, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('EGS') || clean.startsWith('EIS') || clean.startsWith('EMC')) return { line: 'Evergreen', matchedPrefix: 'EISU', freeDays: 7, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('CCL') || clean.startsWith('OOL') || clean.startsWith('COS')) return { line: 'COSCO', matchedPrefix: 'COSU', freeDays: 7, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('YML')) return { line: 'Yang Ming', matchedPrefix: 'YMLU', freeDays: 7, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('HDM') || clean.startsWith('HMM')) return { line: 'HMM', matchedPrefix: 'HMMU', freeDays: 5, model: 'Split', confidence: 0.9 };
  if (clean.startsWith('ZIM') || clean.startsWith('ZCS')) return { line: 'ZIM', matchedPrefix: 'ZIMU', freeDays: 7, model: 'Split', confidence: 0.9 };

  // Default to Maersk
  return { line: 'Maersk', matchedPrefix: 'MSKU', freeDays: 7, model: 'Split', confidence: 0.5 };
}
