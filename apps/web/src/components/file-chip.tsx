import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pdf: "bg-destructive/10 text-destructive",
  docx: "bg-accent text-accent-foreground",
  doc: "bg-accent text-accent-foreground",
  xlsx: "bg-primary/10 text-primary",
  xls: "bg-primary/10 text-primary",
  csv: "bg-primary/10 text-primary",
  md: "bg-foreground/8 text-foreground",
  txt: "bg-foreground/8 text-foreground",
  window: "bg-muted text-muted-foreground",
};

/** Small monospace chip for a capture source (PDF, DOCX, XLSX…). */
export function FileChip({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const key = source.toLowerCase();
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-1.5 py-1 font-mono text-[10.5px] font-bold uppercase",
        STYLES[key] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {source}
    </span>
  );
}
