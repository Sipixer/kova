import { readFile } from "node:fs/promises";
import { extname } from "node:path";

import { parseOffice } from "officeparser";

export type Extracted = { source: string; text: string };

// Office + OpenDocument + PDF — all handled by officeparser in one pass.
const OFFICE = new Set([
  "docx",
  "pptx",
  "xlsx",
  "xlsm",
  "odt",
  "odp",
  "ods",
  "pdf",
]);

// Plain-text-ish formats read directly.
const TEXT = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "tsv",
  "json",
  "log",
  "xml",
  "html",
  "htm",
  "yml",
  "yaml",
]);

function ext(path: string) {
  return extname(path).slice(1).toLowerCase();
}

/** Whether we can pull text content out of this file (otherwise: name-only). */
export function isSupported(path: string) {
  const e = ext(path);
  return OFFICE.has(e) || TEXT.has(e);
}

/** Extract plain text from a document. Returns null when unreadable. */
export async function extractText(path: string): Promise<Extracted | null> {
  const e = ext(path);
  try {
    if (OFFICE.has(e)) {
      const result = await parseOffice(path);
      return { source: e, text: result.toText() };
    }
    if (TEXT.has(e)) {
      return { source: e, text: await readFile(path, "utf8") };
    }
    return null;
  } catch (error) {
    console.error(`[agent] extract failed for ${path}:`, error);
    return null;
  }
}
