import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, RotateCcw } from "lucide-react";

import { FileIcon } from "@/components/file-icon";
import { OpenButtons } from "@/components/open-file-button";
import { useMachines } from "@/hooks/use-machines";
import { formatDay, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/app/timeline")({
  component: Timeline,
});

function Timeline() {
  const recent = useQuery(
    orpc.timeline.live.experimental_liveOptions({ input: { limit: 100 } }),
  );
  const list = recent.data ?? [];
  const { data: machines } = useMachines();
  const online = new Set((machines ?? []).map((m) => m.hostname));

  type Item = (typeof list)[number];

  // The feed is newest-first. Collapse opens that happened back-to-back on the
  // same file ("ouvert juste avant" — no point repeating it), then keep every
  // other open as its own row. An open is a *re-open* when an older open of the
  // same file still sits below it: we keep it in the timeline but grayed out.
  const rows: Item[] = [];
  for (const item of list) {
    const prev = rows.at(-1);
    if (prev && prev.documentId === item.documentId) continue;
    rows.push(item);
  }
  const oldestIndex = new Map<string, number>();
  rows.forEach((item, i) => oldestIndex.set(item.documentId, i));

  const days: { day: string; items: { item: Item; reopen: boolean }[] }[] = [];
  rows.forEach((item, i) => {
    const day = formatDay(item.openedAt);
    let group = days.at(-1);
    if (!group || group.day !== day) {
      group = { day, items: [] };
      days.push(group);
    }
    group.items.push({ item, reopen: i < (oldestIndex.get(item.documentId) ?? i) });
  });

  return (
    <div className="px-4 py-8 pb-16 sm:px-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">Timeline</h1>
      <p className="mt-1.5 mb-8 text-[15px] text-muted-foreground">
        Le fil de ce que vous avez ouvert, par jour.
      </p>

      {list.length === 0 ? (
        <div className="text-[14px] text-muted-foreground">
          Rien pour l'instant. Ouvrez un document pendant que l'agent tourne.
        </div>
      ) : (
        <div className="flex max-w-3xl flex-col gap-9">
          {days.map((group) => (
            <div key={group.day}>
              <div className="mb-2.5 font-mono text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.day}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ item, reopen }) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-3.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-card"
                  >
                    <time className="w-12 shrink-0 text-right font-mono text-[12.5px] tabular-nums text-muted-foreground/70">
                      {formatTime(item.openedAt)}
                    </time>
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        reopen ? "bg-muted-foreground/25" : "bg-primary/60",
                      )}
                    />
                    <FileIcon
                      source={item.source}
                      className={cn("size-7", reopen && "opacity-40 grayscale")}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-[15px] font-semibold",
                            reopen && "font-medium text-muted-foreground",
                          )}
                          title={item.path ?? undefined}
                        >
                          {item.title}
                        </span>
                        {reopen ? (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/80">
                            <RotateCcw className="size-2.5" />
                            réouvert
                          </span>
                        ) : null}
                        {!item.embedded ? (
                          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground/50" />
                        ) : null}
                      </div>
                      {item.summary ? (
                        <p
                          className={cn(
                            "mt-0.5 truncate text-[12.5px] text-muted-foreground/80",
                            reopen && "text-muted-foreground/50",
                          )}
                        >
                          {item.summary}
                        </p>
                      ) : null}
                    </div>

                    {item.path && online.has(item.machineId) ? (
                      <div className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                        <OpenButtons
                          documentId={item.documentId}
                          machineName={item.machineId}
                        />
                      </div>
                    ) : null}
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
