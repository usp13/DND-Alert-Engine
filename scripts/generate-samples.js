const fs = require("fs");
const path = require("path");

// Function to generate a simple standard PDF without external heavy binaries
function createSimplePdf(filePath, title, lines) {
  const contentStream = [
    "BT",
    "/F1 18 Tf",
    "50 750 Td",
    `(${title}) Tj`,
    "/F1 10 Tf",
    "0 -25 Td",
    "(--------------------------------------------------------------------------------) Tj",
  ];

  let yOffset = -20;
  for (const line of lines) {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    contentStream.push(`0 ${yOffset} Td`);
    contentStream.push(`(${escaped}) Tj`);
    yOffset = -18;
  }
  contentStream.push("ET");

  const streamContent = contentStream.join("\n");
  const streamLength = Buffer.byteLength(streamContent);

  const pdfData = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica-Bold
      >>
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length ${streamLength}
>>
stream
${streamContent}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000282 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${350 + streamLength}
%%EOF`;

  const outputDir = path.dirname(filePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(filePath, pdfData);
  console.log(`Generated: ${filePath}`);
}

const samples = {
  1: {
    name: "sample_maersk_delivery_order.pdf",
    title: "MAERSK LINE - DELIVERY ORDER & CONTAINER ADVICE",
    lines: [
      "Document Type: Electronic Delivery Order (e-DO)",
      "Shipping Line: MAERSK (Line Code: MAEU)",
      "Vessel / Voyage: MAERSK MC-KINNEY MOLLER / V-2408W",
      "Port of Discharge: Mundra Port (INMUN1)",
      "Discharge Date / ETA: 2026-09-02",
      "Free Time Allowed: 14 Days Demurrage Free Time",
      "Bill of Lading (BL) No: MAEU928471928",
      "Consignee: Riddhi Siddhi Logistics Pvt Ltd",
      "",
      "CONTAINER LIST & DETAILS:",
      "1. Container: MSKU7284910 | Size: 40ft High Cube | Free Days: 14 | Discharge Date: 2026-09-02",
      "2. Container: MAEU8391024 | Size: 20ft Standard  | Free Days: 14 | Discharge Date: 2026-09-02",
      "3. Container: MSKU1928374 | Size: 40ft High Cube | Free Days: 14 | Discharge Date: 2026-09-02",
      "",
      "Notice: Ensure empty containers are returned to designated depot within 14 free days."
    ]
  },
  2: {
    name: "sample_msc_discharge_list.pdf",
    title: "MSC MEDITERRANEAN SHIPPING COMPANY - DISCHARGE MANIFEST",
    lines: [
      "Document Type: Vessel Discharge List & Free Time Notice",
      "Shipping Line: MSC (Line Code: MEDU)",
      "Vessel / Voyage: MSC GULSUN / V-0826E",
      "Port of Discharge: Kandla Port (INIXY1)",
      "Discharge Date: 2026-09-04",
      "Free Time Allowed: 10 Days Combined Free Time",
      "Booking Reference: BKG-MEDU-882194",
      "Consignee: Gujarat Maritime Trading Co.",
      "",
      "CONTAINER LIST & DETAILS:",
      "1. Container: MEDU9102938 | Size: 20ft Standard  | Free Days: 10 | Discharge Date: 2026-09-04",
      "2. Container: MSCU4819203 | Size: 40ft High Cube | Free Days: 10 | Discharge Date: 2026-09-04",
      "3. Container: MEDU3391028 | Size: 20ft Standard  | Free Days: 10 | Discharge Date: 2026-09-04",
      "4. Container: MSCU1192830 | Size: 40ft High Cube | Free Days: 10 | Discharge Date: 2026-09-04",
      "",
      "Demurrage slabs apply immediately after 10 days free period."
    ]
  },
  3: {
    name: "sample_one_delivery_order.pdf",
    title: "OCEAN NETWORK EXPRESS (ONE) - CONTAINER RELEASE ORDER",
    lines: [
      "Document Type: Cargo Delivery Order & Gate Pass Notice",
      "Shipping Line: ONE (Line Code: ONEY)",
      "Vessel / Voyage: ONE APUS / V-109N",
      "Port of Discharge: Nhava Sheva (INNSA1)",
      "Discharge Date: 2026-09-01",
      "Free Time Allowed: 12 Days Free Time",
      "BL Number: ONEYNSA992019",
      "Notify Party: Apex Customs Clearing Agents",
      "",
      "CONTAINER LIST & DETAILS:",
      "1. Container: ONEY1029384 | Size: 40ft High Cube | Free Days: 12 | Discharge Date: 2026-09-01",
      "2. Container: ONEY5829103 | Size: 20ft Standard  | Free Days: 12 | Discharge Date: 2026-09-01",
      "3. Container: ONEY8839201 | Size: 40ft High Cube | Free Days: 12 | Discharge Date: 2026-09-01",
      "",
      "Return empty containers to Nhava Sheva CFS depot before LFD expiration."
    ]
  },
  4: {
    name: "sample_cosco_delivery_order.pdf",
    title: "COSCO SHIPPING LINES - CONTAINER DELIVERY ORDER",
    lines: [
      "Document Type: Delivery Order (DO) / Free Time Advice",
      "Shipping Line: COSCO (Line Code: COSU)",
      "Vessel / Voyage: COSCO PRIDE / V-058W",
      "Port of Discharge: Chennai Port (INMAA1)",
      "Discharge Date: 2026-09-03",
      "Free Time Allowed: 14 Days Demurrage Free Time",
      "Bill of Lading: COSU629103847",
      "Importer: Southern India Industrial Importers",
      "",
      "CONTAINER LIST & DETAILS:",
      "1. Container: COSU8192039 | Size: 40ft High Cube | Free Days: 14 | Discharge Date: 2026-09-03",
      "2. Container: COSU3910294 | Size: 20ft Standard  | Free Days: 14 | Discharge Date: 2026-09-03",
      "3. Container: COSU4819201 | Size: 40ft High Cube | Free Days: 14 | Discharge Date: 2026-09-03",
      "",
      "Slab 1 rate INR 1,600/day applies post 14 days free period."
    ]
  },
  5: {
    name: "sample_cma_cgm_delivery_order.pdf",
    title: "CMA CGM - DELIVERY ORDER & CONTAINER RELEASE",
    lines: [
      "Document Type: Electronic Delivery Order",
      "Shipping Line: CMA CGM (Line Code: CMAU)",
      "Vessel / Voyage: CMA CGM ANTOINE DE SAINT EXUPERY / V-991E",
      "Port of Discharge: Hazira Port (INHZR1)",
      "Discharge Date: 2026-09-05",
      "Free Time Allowed: 14 Days Free Time",
      "BL Number: CMAU771829304",
      "Consignee: Universal Cargo Forwarders LLP",
      "",
      "CONTAINER LIST & DETAILS:",
      "1. Container: CMAU9182736 | Size: 40ft High Cube | Free Days: 14 | Discharge Date: 2026-09-05",
      "2. Container: CMAU4471920 | Size: 20ft Standard  | Free Days: 14 | Discharge Date: 2026-09-05",
      "3. Container: CMAU6381920 | Size: 40ft High Cube | Free Days: 14 | Discharge Date: 2026-09-05",
      "",
      "Failure to return empties within free time triggers automated detention billing."
    ]
  }
};

const target = process.argv[2];
const outFolder = path.join(process.cwd(), "sample_pdfs");

if (target && samples[target]) {
  const item = samples[target];
  createSimplePdf(path.join(outFolder, item.name), item.title, item.lines);
} else if (target === "all") {
  Object.values(samples).forEach((item) => {
    createSimplePdf(path.join(outFolder, item.name), item.title, item.lines);
  });
} else {
  console.log("Usage: node scripts/generate-samples.js [1|2|3|4|5|all]");
}
