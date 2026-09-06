import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLineByPrefix, validateContainerNumber } from "./container-prefixes";
import zlib from "zlib";

export interface ExtractedContainer {
  container_number: string;
  shipping_line: string;
  shipping_line_code: string;
  demurrage_free_days: number;
  discharge_date: string;
  booking_number?: string;
  bl_number?: string;
  container_type?: string;
  port?: string;
  vessel_name?: string;
}

/**
 * Extracts plain text from a raw PDF buffer without external dependencies.
 * Handles both uncompressed stream blocks and FlateDecode zlib streams.
 */
export function extractTextFromPdfBuffer(pdfBuffer: Buffer): string {
  let combinedText = "";

  // 1. Direct string scan
  const rawString = pdfBuffer.toString("latin1");

  // Extract strings enclosed in parentheses: (Text) Tj or (Text) '
  const parenMatches = rawString.match(/\(([^()]*)\)\s*(?:Tj|'|TJ)/g) || [];
  for (const m of parenMatches) {
    const textOnly = m.replace(/^[\s(]+/, "").replace(/[\s)Tj'TJ]+$/, "");
    combinedText += " " + textOnly;
  }

  // 2. Scan and decompress FlateDecode streams
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(rawString)) !== null) {
    try {
      const streamStart = match.index + match[0].indexOf("stream") + 6;
      // Skip CRLF if present
      const cleanStart = rawString[streamStart] === "\r" && rawString[streamStart + 1] === "\n"
        ? streamStart + 2
        : rawString[streamStart] === "\n"
        ? streamStart + 1
        : streamStart;

      const streamEnd = match.index + match[0].lastIndexOf("endstream");
      const slice = pdfBuffer.subarray(cleanStart, streamEnd);

      let decompressed: Buffer | null = null;
      try {
        decompressed = zlib.inflateSync(slice);
      } catch {
        try {
          decompressed = zlib.inflateRawSync(slice);
        } catch {
          // not a compressed stream or raw stream
        }
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
    } catch {
      // Continue next stream
    }
  }

  combinedText += " " + rawString;
  return combinedText;
}

/**
 * Fallback heuristic parser that parses container tables, lines, dates, and BLs from extracted text.
 */
export function parseContainersFromText(rawText: string, fileName: string): ExtractedContainer[] {
  // Find all unique 11-char ISO container codes (4 uppercase letters + 7 digits)
  const containerMatches = rawText.match(/\b([A-Z]{4}\d{7})\b/gi) || [];
  const uniqueContainers = Array.from(new Set(containerMatches.map((c) => c.toUpperCase())));

  // Extract discharge date or ETA (YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY)
  let detectedDate = "";
  const isoDateMatch = rawText.match(/\b(20\d{2}[-/](?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01]))\b/);
  if (isoDateMatch) {
    detectedDate = isoDateMatch[1].replace(/\//g, "-");
  } else {
    const dmyMatch = rawText.match(/\b((?:0[1-9]|[12]\d|3[01])[-/](?:0[1-9]|1[0-2])[-/](?:20\d{2}))\b/);
    if (dmyMatch) {
      const parts = dmyMatch[1].split(/[-/]/);
      detectedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  if (!detectedDate) {
    detectedDate = new Date().toISOString().split("T")[0];
  }

  // Extract free days
  let freeDays = 14;
  const freeDaysMatch = rawText.match(/(\d{1,2})\s*(?:days|day)\s*(?:free|demurrage|combined)/i)
    || rawText.match(/free\s*(?:days|time)[\s:=]*(\d{1,2})/i);
  if (freeDaysMatch) {
    const parsed = parseInt(freeDaysMatch[1], 10);
    if (parsed > 0 && parsed <= 60) freeDays = parsed;
  }

  // Extract BL / Booking number
  let blNumber = "";
  const blMatch = rawText.match(/(?:BL|B\/L|Bill of Lading|Booking|BKG)[\s#:.-]*([A-Z0-9\-\/]{6,25})/i);
  if (blMatch) {
    blNumber = blMatch[1].trim();
  }

  // Extract Port
  let port = "Kandla";
  if (/mundra/i.test(rawText)) port = "Mundra";
  else if (/nhava\s*sheva|jnpm|jnpt/i.test(rawText)) port = "Nhava Sheva";
  else if (/chennai/i.test(rawText)) port = "Chennai";
  else if (/hazira/i.test(rawText)) port = "Hazira";
  else if (/kandla/i.test(rawText)) port = "Kandla";

  // Extract Vessel
  let vesselName = "Cargo Vessel";
  const vesselMatch = rawText.match(/vessel[\s/:]+([A-Za-z0-9\s\.\-]+?)(?:\/|\n|\r|\||\s{2,}|Voyage)/i);
  if (vesselMatch && vesselMatch[1].trim().length > 2) {
    vesselName = vesselMatch[1].trim();
  }

  // Build extracted container items
  if (uniqueContainers.length > 0) {
    return uniqueContainers.map((containerNo) => {
      const lineName = getLineByPrefix(containerNo);
      const prefix = containerNo.substring(0, 4);

      return {
        container_number: containerNo,
        shipping_line: lineName,
        shipping_line_code: prefix,
        demurrage_free_days: freeDays,
        discharge_date: detectedDate,
        bl_number: blNumber || `BL-${containerNo.substring(4)}`,
        booking_number: blNumber || undefined,
        container_type: /20ft|20\s*standard/i.test(rawText) ? "20ft" : "40ft",
        port,
        vessel_name: vesselName,
      };
    });
  }

  // If no ISO matches found, return empty array so user can add manually or inspect error
  return [];
}

/**
 * Extracts container details from a DO/Invoice PDF base64 file using Gemini or Native Stream OCR.
 */
export async function extractContainersFromPDF(
  pdfBase64: string,
  fileName: string
): Promise<ExtractedContainer[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const pdfBuffer = Buffer.from(pdfBase64, "base64");

  // If Gemini API key is configured and valid, use Gemini 3.5 Flash
  if (apiKey && !apiKey.startsWith("AIzaSy...") && apiKey.trim().length > 15) {
    const candidateModels = ["gemini-3.5-flash", "gemini-3-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
          Analyze this PDF shipping document (Delivery Order / Booking Confirmation / Invoice / Discharge List).
          Identify all container numbers listed in the document.
          For each container, extract:
          1. Container Number (11-character identifier, e.g. MSKU1234567)
          2. Shipping Line Name (e.g. Maersk, MSC, COSCO, ONE, CMA CGM)
          3. Shipping Line Code (4-letter code, e.g. MAEU, MEDU, COSU, ONEY, CMAU)
          4. Demurrage free days allowed (number of days, e.g. 14)
          5. Discharge Date or ETA (YYYY-MM-DD format)
          6. Booking number or Bill of Lading (BL) number
          7. Port of Discharge (e.g. Kandla, Mundra, Nhava Sheva, Chennai, Hazira)
          8. Vessel Name

          Return strictly as a JSON array matching:
          [{
            "container_number": "MSKU1234567",
            "shipping_line": "Maersk",
            "shipping_line_code": "MAEU",
            "demurrage_free_days": 14,
            "discharge_date": "2026-09-02",
            "bl_number": "MAEU928471928",
            "port": "Mundra",
            "vessel_name": "MAERSK MC-KINNEY"
          }]
        `;

        const pdfPart = {
          inlineData: {
            data: pdfBase64,
            mimeType: "application/pdf",
          },
        };

        const result = await model.generateContent([prompt, pdfPart]);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const containers: ExtractedContainer[] = JSON.parse(jsonStr);

        if (Array.isArray(containers) && containers.length > 0) {
          return containers.map((c) => {
            if (!c.shipping_line || c.shipping_line.toLowerCase() === "unknown") {
              c.shipping_line = getLineByPrefix(c.container_number);
            }
            if (!c.shipping_line_code) {
              c.shipping_line_code = c.container_number.substring(0, 4);
            }
            if (!c.demurrage_free_days || c.demurrage_free_days <= 0) {
              c.demurrage_free_days = 14;
            }
            return c;
          });
        }
      } catch (geminiError: any) {
        // If this model is unavailable, loop to next or proceed to native parser
        if (candidateModels.indexOf(modelName) === candidateModels.length - 1) {
          console.info(`[AI Notice] Gemini API unavailable (${geminiError?.message?.slice(0, 80) || "error"}). Using native PDF stream parser.`);
        }
      }
    }
  }

  // Native Stream & Text Extraction (Direct PDF Parsing)
  const extractedText = extractTextFromPdfBuffer(pdfBuffer);
  const localResults = parseContainersFromText(extractedText, fileName);

  return localResults;
}
