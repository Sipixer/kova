import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, RotateCw } from "lucide-react";

import { FileChip } from "@/components/file-chip";
import { OpenButtons } from "@/components/open-file-button";
import { useMachines } from "@/hooks/use-machines";
import { formatDay, formatTime, formatWhen } from "@/lib/format";
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
  // Group by day, then collapse re-opens of the same file into one entry: the
  // newest open headlines, earlier opens of that day are shown small below.
  const days: { day: string; docs: { doc: Item; opens: Date[] }[] }[] = [];
  for (const item of list) {
    const day = formatDay(item.openedAt);
    let dayGroup = days.at(-1);
    if (!dayGroup || dayGroup.day !== day) {
      dayGroup = { day, docs: [] };
      days.push(dayGroup);
    }
    const existing = dayGroup.docs.find(
      (d) => d.doc.documentId === item.documentId,
    );
    if (existing) existing.opens.push(item.openedAt);
    else dayGroup.docs.push({ doc: item, opens: [item.openedAt] });
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
          {days.map((group) => (
            <div key={group.day}>
              <div className="mb-3 font-mono text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.day}
              </div>
              <div className="ml-1.5 flex flex-col gap-2.5 border-l-2 border-border pl-5">
                {group.docs.map(({ doc, opens }) => (
                  <div
                    key={doc.documentId}
                    className="relative flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <span className="absolute -left-[27px] size-2.5 rounded-full border-2 border-background bg-primary" />
                    <FileChip source={doc.source} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[14.5px] font-semibold">
                          {doc.title}
                        </span>
                        {opens.length > 1 ? (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                            <RotateCw className="size-2.5" />
                            {opens.length}×
                          </span>
                        ) : null}
                        {!doc.embedded ? (
                          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            indexation…
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground">
                        {doc.path ?? doc.machineId}
                      </div>
                      {opens.length > 1 ? (
                        <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/60">
                          réouvert · {opens.slice(1).map((o) => formatTime(o)).join(" · ")}
                        </div>
                      ) : null}
                    </div>
                    {doc.path && online.has(doc.machineId) ? (
                      <OpenButtons
                        documentId={doc.documentId}
                        machineName={doc.machineId}
                      />
                    ) : null}
                    <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground/80">
                      {formatWhen(doc.openedAt)}
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
