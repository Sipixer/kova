import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { FileChip } from "@/components/file-chip";
import { OpenButtons } from "@/components/open-file-button";
import { useMachines } from "@/hooks/use-machines";
import { formatDay, formatWhen } from "@/lib/format";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/app/timeline")({
  component: Timeline,
});

function Timeline() {
  const recent = useQuery(
    orpc.captures.recent.queryOptions({ input: { limit: 100 } }),
  );
  const list = recent.data ?? [];
  const { data: machines } = useMachines();
  const online = new Set((machines ?? []).map((m) => m.hostname));

  // Group by day, preserving the recent-first order.
  const groups: { day: string; items: typeof list }[] = [];
  for (const item of list) {
    const day = formatDay(item.capturedAt);
    const last = groups.at(-1);
    if (last && last.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }

  return (
    <div className="px-4 py-8 pb-16 sm:px-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">Timeline</h1>
      <p className="mt-1.5 mb-7 text-[15px] text-muted-foreground">
        Le fil de ce que vous avez ouvert, par jour.
      </p>

      {list.length === 0 ? (
        <div className="text-[14px] text-muted-foreground">
          Rien pour l'instant. Ouvrez un document pendant que l'agent tourne.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.day}>
              <div className="mb-3 font-mono text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.day}
              </div>
              <div className="ml-1.5 flex flex-col gap-2.5 border-l-2 border-border pl-5">
                {group.items.map((it) => (
                  <div
                    key={it.id}
                    className="relative flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <span className="absolute -left-[27px] size-2.5 rounded-full border-2 border-background bg-primary" />
                    <FileChip source={it.source} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-semibold">
                        {it.title}
                      </div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground">
                        {it.path ?? it.machineId}
                      </div>
                    </div>
                    {it.path && online.has(it.machineId) ? (
                      <OpenButtons captureId={it.id} machineName={it.machineId} />
                    ) : null}
                    <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground/80">
                      {formatWhen(it.capturedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
