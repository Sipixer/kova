import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  XLS: "bg-primary/10 text-primary",
  DOC: "bg-foreground/8 text-foreground",
  PDF: "bg-destructive/10 text-destructive",
  WEB: "bg-accent text-accent-foreground",
  IMG: "bg-chart-4/20 text-foreground",
};

/** Small monospace file-type chip (XLS, PDF, WEB…). */
export function FileChip({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-1.5 py-1 font-mono text-[10.5px] font-bold uppercase",
        STYLES[type] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {type}
    </span>
  );
}
