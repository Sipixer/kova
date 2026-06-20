import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";

import { FileChip } from "@/components/file-chip";
import { OnlineDot } from "@/components/online-dot";
import { Button } from "@/components/ui/button";
import { platformLabel, useMachines } from "@/hooks/use-machines";
import { formatWhen } from "@/lib/format";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/app/")({
  component: Accueil,
});

function Accueil() {
  const { data: machines } = useMachines();
  const machineList = machines ?? [];

  const recent = useQuery(
    orpc.captures.live.experimental_liveOptions({ input: { limit: 6 } }),
  );
  const recentList = recent.data ?? [];

  return (
    <div className="px-4 py-8 pb-16 sm:px-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">Bonjour, Léa</h1>
      <p className="mt-1.5 mb-6 text-[15px] text-muted-foreground">
        Voici ce que Kova a retenu récemment.
      </p>

      <Link
        to="/app/recherche"
        className="mb-6 flex items-center gap-3.5 rounded-2xl border border-primary/15 bg-accent px-5 py-4.5 transition-colors hover:bg-accent/70"
      >
        <Search className="size-[22px] text-primary" />
        <div className="flex-1">
          <div className="text-base font-bold">Cherchez dans votre mémoire</div>
          <div className="text-[13.5px] text-accent-foreground/80">
            Décrivez une idée, Kova retrouve le fichier ou la page.
          </div>
        </div>
        <ArrowRight className="size-[18px] text-primary" />
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* recent activity */}
        <section className="rounded-2xl border border-border bg-card p-2">
          <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
            <span className="text-sm font-bold">Activité récente</span>
            <Link
              to="/app/timeline"
              className="text-[12.5px] font-semibold text-primary hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="flex flex-col">
            {recentList.length === 0 ? (
              <div className="px-3.5 py-4 text-[13px] text-muted-foreground">
                Rien encore. Ouvrez un document pendant que l'agent tourne.
              </div>
            ) : (
              recentList.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 hover:bg-muted/60"
                >
                  <FileChip source={it.source} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {it.title}
                      </span>
                      {!it.embedded ? (
                        <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
                      ) : null}
                    </div>
                    <div className="truncate font-mono text-[11px] text-muted-foreground">
                      {it.path ?? it.machineId}
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground/80">
                    {formatWhen(it.capturedAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* side column */}
        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-border bg-card px-4 pt-4 pb-2">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold">Vos machines</span>
              <Link
                to="/app/machines"
                className="font-mono text-[11px] font-semibold text-primary hover:underline"
              >
                {machineList.length} en ligne
              </Link>
            </div>
            {machineList.length === 0 ? (
              <div className="py-3 text-[13px] text-muted-foreground">
                Aucune machine connectée.
              </div>
            ) : (
              machineList.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 py-2">
                  <OnlineDot />
                  <div className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">
                    {m.hostname}
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground/80">
                    {platformLabel(m.platform)}
                  </span>
                </div>
              ))
            )}
          </section>

          <section className="rounded-2xl bg-foreground p-5 text-background">
            <div className="mb-2.5 flex items-center gap-2.5">
              <Sparkles className="size-[18px] text-chart-3" />
              <span className="text-sm font-bold">Connexion IA</span>
            </div>
            <p className="mb-3.5 text-[13px] leading-snug text-background/70">
              Pas encore connecté. Branchez ChatGPT ou Claude pour qu'ils
              répondent à partir de votre travail.
            </p>
            <Button
              render={<Link to="/app/ia" />}
              nativeButton={false}
              className="w-full"
            >
              Gérer la connexion
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
