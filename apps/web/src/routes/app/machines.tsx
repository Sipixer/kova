import { createFileRoute } from "@tanstack/react-router";
import { MonitorSmartphone } from "lucide-react";

import { OnlineDot } from "@/components/online-dot";
import { Badge } from "@/components/ui/badge";
import { platformLabel, useMachines } from "@/hooks/use-machines";

export const Route = createFileRoute("/app/machines")({
  component: Machines,
});

function Machines() {
  const { data: machines } = useMachines();
  const list = machines ?? [];

  return (
    <div className="px-4 py-8 pb-16 sm:px-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Machines</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            Les ordinateurs connectés à votre mémoire Kova, en temps réel.
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-primary">
          {list.length > 0 ? (
            <OnlineDot />
          ) : (
            <span className="size-2 rounded-full bg-muted-foreground/40" />
          )}
          {list.length} en ligne
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <MonitorSmartphone className="size-6" />
          </div>
          <div className="text-[15px] font-semibold">Aucune machine connectée</div>
          <p className="max-w-sm text-[13.5px] text-muted-foreground">
            Lancez{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[12px]">
              bun run agent
            </code>{" "}
            sur un ordinateur pour le voir apparaître ici instantanément.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {list.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <MonitorSmartphone className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{m.hostname}</span>
                  <Badge variant="secondary" className="font-mono">
                    {platformLabel(m.platform)}
                  </Badge>
                </div>
                <div className="font-mono text-[11.5px] text-muted-foreground">
                  pid {m.pid} · {m.id.slice(0, 8)}
                </div>
              </div>
              <div className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                <OnlineDot />
                <span className="hidden sm:inline">en ligne</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
