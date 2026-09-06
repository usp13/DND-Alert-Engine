import { ContainerPrefix } from "@/types";

export const CONTAINER_PREFIXES: ContainerPrefix[] = [
  { prefix: "MSKU", line_name: "Maersk", line_code: "MAEU" },
  { prefix: "MAEU", line_name: "Maersk", line_code: "MAEU" },
  { prefix: "PONU", line_name: "Maersk", line_code: "MAEU" },
  { prefix: "MEDU", line_name: "MSC", line_code: "MEDU" },
  { prefix: "MSCU", line_name: "MSC", line_code: "MEDU" },
  { prefix: "COSU", line_name: "COSCO", line_code: "COSU" },
  { prefix: "CHSU", line_name: "COSCO", line_code: "COSU" },
  { prefix: "ONEY", line_name: "ONE", line_code: "ONEY" },
  { prefix: "NYKU", line_name: "ONE", line_code: "ONEY" },
  { prefix: "MOLU", line_name: "ONE", line_code: "ONEY" },
  { prefix: "KKLU", line_name: "ONE", line_code: "ONEY" },
  { prefix: "CMAU", line_name: "CMA CGM", line_code: "CMAU" },
  { prefix: "APZU", line_name: "CMA CGM", line_code: "CMAU" },
  { prefix: "ANLU", line_name: "CMA CGM", line_code: "CMAU" },
  { prefix: "HLCU", line_name: "Hapag-Lloyd", line_code: "HLCU" },
  { prefix: "HLXU", line_name: "Hapag-Lloyd", line_code: "HLCU" },
  { prefix: "EGLV", line_name: "Evergreen", line_code: "EGLV" },
  { prefix: "EMCU", line_name: "Evergreen", line_code: "EGLV" },
  { prefix: "YMLU", line_name: "Yang Ming", line_code: "YMLU" },
  { prefix: "WHLU", line_name: "Wan Hai", line_code: "WHLU" },
  { prefix: "ZIMU", line_name: "ZIM", line_code: "ZIMU" },
];

export function getLineByPrefix(containerNumber: string): string {
  if (!containerNumber || containerNumber.length < 4) return "Unknown";
  const prefix = containerNumber.substring(0, 4).toUpperCase();
  const match = CONTAINER_PREFIXES.find((p) => p.prefix === prefix);
  return match ? match.line_name : "Unknown";
}

/**
 * Validates container number format using ISO 6346 standard basic checks.
 * Format: 4 letters prefix, 6 digits serial, 1 check digit. (Total 11 chars)
 */
export function validateContainerNumber(containerNumber: string): boolean {
  const cleanStr = containerNumber.replace(/\s+/g, "").toUpperCase();
  if (cleanStr.length !== 11) return false;
  
  // 4 letters prefix
  const prefixRegex = /^[A-Z]{4}$/;
  if (!prefixRegex.test(cleanStr.substring(0, 4))) return false;
  
  // 7 digits (serial + check digit)
  const serialRegex = /^[0-9]{7}$/;
  if (!serialRegex.test(cleanStr.substring(4))) return false;
  
  return true;
}
