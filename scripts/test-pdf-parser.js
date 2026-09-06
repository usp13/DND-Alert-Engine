const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function extractTextFromPdfBuffer(pdfBuffer) {
  let combinedText = "";
  const rawString = pdfBuffer.toString("latin1");
  const parenMatches = rawString.match(/\(([^()]*)\)\s*(?:Tj|'|TJ)/g) || [];
  for (const m of parenMatches) {
    const textOnly = m.replace(/^[\s(]+/, "").replace(/[\s)Tj'TJ]+$/, "");
    combinedText += " " + textOnly;
  }

  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match;
  while ((match = streamRegex.exec(rawString)) !== null) {
    try {
      const streamStart = match.index + match[0].indexOf("stream") + 6;
      const cleanStart = rawString[streamStart] === "\r" && rawString[streamStart + 1] === "\n"
        ? streamStart + 2
        : rawString[streamStart] === "\n"
        ? streamStart + 1
        : streamStart;

      const streamEnd = match.index + match[0].lastIndexOf("endstream");
      const slice = pdfBuffer.subarray(cleanStart, streamEnd);

      let decompressed = null;
      try {
        decompressed = zlib.inflateSync(slice);
      } catch {
        try {
          decompressed = zlib.inflateRawSync(slice);
        } catch {}
      }

      if (decompressed) {
        const streamText = decompressed.toString("latin1");
        const subMatches = streamText.match(/\(([^()]*)\)\s*(?:Tj|'|TJ)/g) || [];
        for (const sm of subMatches) {
          const clean = sm.replace(/^[\s(]+/, "").replace(/[\s)Tj'TJ]+$/, "");
          combinedText += " " + clean;
        }
        combinedText += " " + streamText;
      }
    } catch {}
  }
  combinedText += " " + rawString;
  return combinedText;
}

function parseContainersFromText(rawText, fileName) {
  const containerMatches = rawText.match(/\b([A-Z]{4}\d{7})\b/gi) || [];
  const uniqueContainers = Array.from(new Set(containerMatches.map((c) => c.toUpperCase())));

  let detectedDate = "";
  const isoDateMatch = rawText.match(/\b(20\d{2}[-/](?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01]))\b/);
  if (isoDateMatch) {
    detectedDate = isoDateMatch[1].replace(/\//g, "-");
  }

  let freeDays = 14;
  const freeDaysMatch = rawText.match(/(\d{1,2})\s*(?:days|day)\s*(?:free|demurrage|combined)/i)
    || rawText.match(/free\s*(?:days|time)[\s:=]*(\d{1,2})/i);
  if (freeDaysMatch) {
    const parsed = parseInt(freeDaysMatch[1], 10);
    if (parsed > 0 && parsed <= 60) freeDays = parsed;
  }

  let blNumber = "";
  const blMatch = rawText.match(/(?:BL|B\/L|Bill of Lading|Booking|BKG)[\s#:.-]*([A-Z0-9\-\/]{6,25})/i);
  if (blMatch) {
    blNumber = blMatch[1].trim();
  }

  return uniqueContainers.map((c) => ({
    container_number: c,
    prefix: c.substring(0, 4),
    demurrage_free_days: freeDays,
    discharge_date: detectedDate,
    bl_number: blNumber
  }));
}

const files = fs.readdirSync("sample_pdfs").filter(f => f.endsWith(".pdf"));
files.forEach((f) => {
  const buf = fs.readFileSync(path.join("sample_pdfs", f));
  const text = extractTextFromPdfBuffer(buf);
  const res = parseContainersFromText(text, f);
  console.log(`\n=== Parsed: ${f} ===`);
  console.log(res);
});
