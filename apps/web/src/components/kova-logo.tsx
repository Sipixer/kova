import { cn } from "@/lib/utils";

/** Kova brand mark — rounded square with an offset orbiting dot. */
export function KovaLogo({
  className,
  size = 27,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 27 27"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="23"
        height="23"
        rx="7.5"
        className="fill-primary"
      />
      <circle cx="13.5" cy="13.5" r="4.4" className="fill-primary-foreground" />
      <circle
        cx="20.5"
        cy="6.5"
        r="2.1"
        className="fill-primary-foreground"
        opacity="0.55"
      />
    </svg>
  );
}

export function KovaWordmark({ size = 27 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <KovaLogo size={size} />
      <span className="text-xl font-extrabold tracking-tight">Kova</span>
    </div>
  );
}
