import { cn } from "@/lib/utils";

/** Pulsing "online" indicator dot (green ping ring + solid core). */
export function OnlineDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-primary" />
    </span>
  );
}
