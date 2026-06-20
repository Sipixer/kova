const MARKUP = new Set(["html", "htm", "xml", "svg", "xhtml"]);

/** Strip tags + script/style bodies so markup files summarise as readable text. */
function stripMarkup(content: string): string {
  return content
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(nbsp|amp|lt|gt|quot|#\d+);/gi, " ");
}

/**
 * A tiny, human one-liner describing a document — its most representative
 * opening sentence, trimmed to a handful of words. Fully local and
 * language-agnostic (no model): just enough to recognise a file at a glance,
 * e.g. "Itinéraire de 5 jours à Barcelone en juillet…".
 */
export function summarize(
  content: string | null | undefined,
  source?: string,
): string | null {
  if (!content) return null;

  const raw = source && MARKUP.has(source.toLowerCase()) ? stripMarkup(content) : content;
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length < 3) return null;

  // First sentence, or the whole thing if it has no terminator.
  const firstSentence = text.split(/(?<=[.!?…])\s/u)[0] ?? text;
  const words = firstSentence.split(" ").filter(Boolean);

  const MAX_WORDS = 10;
  const MAX_CHARS = 90;
  let summary = words.slice(0, MAX_WORDS).join(" ");
  if (summary.length > MAX_CHARS) {
    summary = summary.slice(0, MAX_CHARS).replace(/\s+\S*$/, "");
  }

  const wasCut = summary.length < firstSentence.length;
  const clean = summary.replace(/[\s.,;:–-]+$/u, "");
  if (!clean) return null;
  return wasCut ? `${clean}…` : clean;
}
