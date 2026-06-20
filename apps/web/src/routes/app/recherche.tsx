import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useRef, useState } from "react";

import { FileChip } from "@/components/file-chip";
import { OpenButtons } from "@/components/open-file-button";
import { useMachines } from "@/hooks/use-machines";
import { formatWhen } from "@/lib/format";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/app/recherche")({
  component: Recherche,
});

const EXAMPLES = [
  "le document sur les vacances",
  "comparatif d'hébergement vidéo",
  "le tableau de statistiques",
];

function Recherche() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  const results = useQuery(
    orpc.search.queryOptions({
      input: { query },
      enabled: query.trim().length > 0,
      staleTime: 60_000,
    }),
  );

  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const submit = (q: string) => {
    clearTimeout(debounce.current);
    setText(q);
    setQuery(q.trim());
  };

  const onType = (value: string) => {
    setText(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setQuery(value.trim()), 280);
  };

  const list = results.data ?? [];
  const { data: machines } = useMachines();
  const online = new Set((machines ?? []).map((m) => m.hostname));

  return (
    <div className="max-w-3xl px-4 py-8 pb-16 sm:px-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">
        Recherche sémantique
      </h1>
      <p className="mt-1.5 mb-5 text-[15px] text-muted-foreground">
        Tapez une idée, pas un nom de fichier. Kova remonte vos documents par le
        sens.
      </p>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
        <Search className="size-[22px] shrink-0 text-primary" />
        <input
          autoFocus
          value={text}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(text)}
          placeholder="le fichier de budget ouvert la semaine dernière…"
          className="w-full bg-transparent text-[17px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      {query.trim().length === 0 ? (
        <div className="mt-7">
          <div className="mb-3 font-mono text-[11.5px] uppercase tracking-wider text-muted-foreground">
            Exemples
          </div>
          <div className="flex flex-wrap gap-2.5">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => submit(e)}
                className="rounded-full border border-border bg-card px-3.5 py-2 text-[13.5px] text-foreground/80 hover:bg-muted"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ) : results.isPending ? (
        <div className="mt-8 text-center text-[14px] text-muted-foreground">
          Recherche…
        </div>
      ) : list.length === 0 ? (
        <div className="mt-8 text-center">
          <div className="text-[15px] font-semibold text-foreground/80">
            Aucun souvenir ne correspond
          </div>
          <div className="mt-1.5 text-[13.5px] text-muted-foreground">
            Essayez une autre formulation.
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {list.map((it) => (
            <div
              key={it.id}
              className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4"
            >
              <FileChip source={it.source} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[15px] font-bold">{it.title}</span>
                  <span className="font-mono text-[11px] font-semibold text-primary">
                    {Math.round(it.similarity * 100)} % pertinent
                  </span>
                </div>
                {it.snippet ? (
                  <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-muted-foreground">
                    {it.snippet}
                  </p>
                ) : null}
                <div className="mt-1.5 truncate font-mono text-[11px] text-muted-foreground/80">
                  {it.path ?? it.machineId}
                  {it.lastOpenedAt ? ` · ${formatWhen(it.lastOpenedAt)}` : ""}
                </div>
              </div>
              {it.path && online.has(it.machineId) ? (
                <OpenButtons documentId={it.id} machineName={it.machineId} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
