import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Check, Search, Sparkles } from "lucide-react";

import { KovaLogo, KovaWordmark } from "@/components/kova-logo";
import { OnlineDot } from "@/components/online-dot";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

const SHELL = "mx-auto w-full max-w-[1140px] px-7";

function Landing() {
  return (
    <div className="min-h-svh bg-background">
      <Nav />
      <Hero />
      <ProductVisual />
      <HowItWorks />
      <TrustBand />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className={`${SHELL} flex items-center justify-between py-3.5`}>
        <KovaWordmark size={27} />
        <nav className="flex items-center gap-7">
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#fonctionnalites" className="hover:text-foreground">
              Fonctionnalités
            </a>
            <a href="#comment" className="hover:text-foreground">
              Comment ça marche
            </a>
            <a href="#tarifs" className="hover:text-foreground">
              Tarifs
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              render={<Link to="/app" />}
              nativeButton={false}
            >
              Se connecter
            </Button>
            <Button render={<Link to="/app" />} nativeButton={false}>
              Commencer
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3.5 py-1.5">
      <span className="size-[7px] rounded-full bg-primary" />
      <span className="font-mono text-[11.5px] font-semibold uppercase tracking-wider text-accent-foreground">
        {children}
      </span>
    </div>
  );
}

function Hero() {
  return (
    <section className={`${SHELL} pt-20 pb-9`}>
      <Eyebrow>Mémoire de contexte · pour votre IA</Eyebrow>
      <h1 className="mt-6 max-w-[15ch] text-5xl font-extrabold leading-[1.02] tracking-tighter sm:text-6xl lg:text-[72px]">
        Votre ordinateur se souvient. Votre IA aussi.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
        Kova suit discrètement ce sur quoi vous travaillez et le rend accessible
        à l'IA que vous utilisez déjà. Plus besoin de tout réexpliquer : demandez,
        elle sait.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          size="xl"
          render={<Link to="/app" />}
          nativeButton={false}
          className="shadow-[0_14px_30px_-12px] shadow-primary/60"
        >
          Commencer gratuitement
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button
          size="xl"
          variant="outline"
          render={<Link to="/app" />}
          nativeButton={false}
        >
          Voir une démo
        </Button>
      </div>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Une machine · sans carte bancaire
      </p>
    </section>
  );
}

function ProductVisual() {
  return (
    <div
      id="fonctionnalites"
      className="mx-auto mt-4 w-full max-w-[1040px] scroll-mt-24 px-7"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_60px_-30px] shadow-foreground/35">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-secondary px-4.5 py-3">
          <span className="size-2.5 rounded-full bg-chart-5" />
          <span className="size-2.5 rounded-full bg-chart-4" />
          <span className="size-2.5 rounded-full bg-chart-2" />
          <span className="ml-2.5 font-mono text-xs text-muted-foreground">
            kova · recherche
          </span>
          <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-primary">
            <OnlineDot />2 machines en ligne
          </span>
        </div>
        {/* body */}
        <div className="px-6 pt-6 pb-7">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-popover px-4 py-3.5">
            <Search className="size-[19px] text-muted-foreground" />
            <span className="text-base text-foreground/80">
              le tableau de budget du trimestre
            </span>
            <span className="-ml-0.5 h-[19px] w-0.5 bg-primary" />
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">
              recherche par le sens
            </span>
          </div>

          {/* top result */}
          <div className="mt-4 flex items-start gap-3.5 rounded-xl border border-primary/15 bg-accent p-4">
            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1.5 font-mono text-[11px] font-bold text-accent-foreground">
              XLS
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-bold">Budget T2 2026.xlsx</span>
                <span className="font-mono text-[11px] font-semibold text-primary">
                  96 % pertinent
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-snug text-muted-foreground">
                Prévisionnel des dépenses par poste — marge brute estimée à 38 %.
              </p>
              <span className="font-mono text-[11px] text-muted-foreground/80">
                MacBook de Léa · il y a 2 h
              </span>
            </div>
          </div>

          {/* AI answer */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-popover px-4 py-3.5">
            <Sparkles className="mt-0.5 size-[22px] shrink-0 text-primary" />
            <div className="flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-[12.5px] font-bold text-foreground/80">
                  Votre IA répond
                </span>
                <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                  via Claude
                </span>
              </div>
              <p className="text-[14.5px] leading-normal text-foreground">
                « D'après <b>Budget T2 2026.xlsx</b>, la marge brute prévue pour le
                trimestre est de <b>38 %</b>. »
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Installez, oubliez",
    body: "Un petit agent tourne en fond, sans vous déranger. Il capture ce que vous ouvrez — Word, Excel, PDF, pages web — et rien d'autre. Vous gardez le contrôle de ce qui est suivi.",
  },
  {
    n: "02",
    title: "Tout est retrouvable",
    body: "Vos documents deviennent cherchables par le sens, pas seulement par leur nom. « Le tableau de budget du trimestre » suffit, même si vous avez oublié où il est.",
  },
  {
    n: "03",
    title: "Votre IA, en mieux",
    body: "Connectez Kova à ChatGPT ou Claude en un clic. Votre assistant accède à votre contexte et répond à partir de votre vrai travail. Vous restez sur les outils que vous aimez.",
  },
];

function HowItWorks() {
  return (
    <section id="comment" className={`${SHELL} scroll-mt-24 pt-24 pb-5`}>
      <h2 className="text-[34px] font-extrabold tracking-tight">
        Comment ça marche
      </h2>
      <p className="mt-3 mb-10 text-[17px] text-muted-foreground">
        Trois étapes, puis vous oubliez qu'il est là.
      </p>
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-border bg-card p-6.5"
          >
            <div className="mb-4.5 font-mono text-[13px] font-bold text-primary">
              {s.n}
            </div>
            <h3 className="mb-2.5 text-[19px] font-bold tracking-tight">
              {s.title}
            </h3>
            <p className="text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const TRUST = [
  {
    title: "Toutes vos machines",
    body: "Mac et PC réunis dans une seule mémoire.",
  },
  {
    title: "ChatGPT & Claude",
    body: "Branchez l'assistant que vous préférez.",
  },
  {
    title: "Recherche par le sens",
    body: "Décrivez une idée, pas un nom de fichier.",
  },
];

function TrustBand() {
  return (
    <section className={`${SHELL} py-15`}>
      <div className="relative overflow-hidden rounded-3xl bg-foreground px-12 py-13 text-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_0%,color-mix(in_oklch,var(--primary)_30%,transparent),transparent)]" />
        <div className="relative max-w-2xl">
          <div className="mb-4.5 inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-wider text-chart-3">
            <Boxes className="size-3.5" />
            Une seule mémoire
          </div>
          <h2 className="mb-3.5 text-[32px] font-extrabold tracking-tight">
            Tout votre travail, au même endroit.
          </h2>
          <p className="text-[17px] leading-relaxed text-background/70 text-pretty">
            Kova rassemble ce que vous ouvrez sur toutes vos machines en un index
            unique, interrogeable depuis l'IA que vous utilisez déjà.
          </p>
        </div>
        <div className="relative mt-9 grid gap-4.5 sm:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.title} className="border-t border-background/15 pt-4">
              <div className="mb-1.5 text-[15px] font-bold">{t.title}</div>
              <div className="text-[13.5px] leading-snug text-background/60">
                {t.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Plan = {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  cta: string;
  featured?: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  {
    name: "Gratuit",
    tagline: "Pour démarrer",
    price: "0 €",
    unit: "/ pour toujours",
    cta: "Commencer",
    features: [
      "1 machine",
      "Recherche sémantique",
      "1 connexion IA",
      "Historique 30 jours",
    ],
  },
  {
    name: "Pro",
    tagline: "Pour les indépendants",
    price: "9 €",
    unit: "/ mois",
    cta: "Choisir Pro",
    featured: true,
    features: [
      "Machines illimitées",
      "Historique illimité",
      "ChatGPT + Claude",
      "Timeline avancée & filtres",
      "Support prioritaire",
    ],
  },
  {
    name: "Équipe",
    tagline: "Pour les organisations",
    price: "19 €",
    unit: "/ membre / mois",
    cta: "Contacter l'équipe",
    features: [
      "Tout le plan Pro",
      "Espace partagé d'équipe",
      "Contrôles admin & SSO",
      "Journaux d'audit",
    ],
  },
];

function Pricing() {
  return (
    <section id="tarifs" className={`${SHELL} scroll-mt-24 pt-9 pb-5`}>
      <div className="mb-10 text-center">
        <div className="mb-3 font-mono text-[11.5px] uppercase tracking-wider text-primary">
          Tarifs
        </div>
        <h2 className="text-[34px] font-extrabold tracking-tighter">
          Simple, à la machine
        </h2>
        <p className="mt-3 text-[17px] text-muted-foreground">
          Commencez gratuitement. Passez à Pro quand vous ajoutez des machines.
        </p>
      </div>
      <div className="grid items-start gap-4.5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.featured;
  return (
    <div
      className={
        featured
          ? "relative rounded-2xl bg-foreground p-7 text-background shadow-[0_24px_50px_-24px] shadow-foreground/60"
          : "rounded-2xl border border-border bg-card p-7"
      }
    >
      {featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-primary px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          Populaire
        </span>
      )}
      <div className="text-[15px] font-bold">{plan.name}</div>
      <div
        className={`mt-0.5 mb-4.5 text-[13px] ${featured ? "text-background/60" : "text-muted-foreground"}`}
      >
        {plan.tagline}
      </div>
      <div className="mb-5.5 flex items-baseline gap-1.5">
        <span className="text-[40px] font-extrabold tracking-tighter">
          {plan.price}
        </span>
        <span
          className={`text-sm ${featured ? "text-background/60" : "text-muted-foreground"}`}
        >
          {plan.unit}
        </span>
      </div>
      <Button
        variant={featured ? "default" : "outline"}
        render={<Link to="/app" />}
        nativeButton={false}
        className="mb-5.5 w-full"
      >
        {plan.cta}
      </Button>
      <div className="flex flex-col gap-2.5">
        {plan.features.map((f) => (
          <div
            key={f}
            className={`flex items-center gap-2.5 text-sm ${featured ? "text-background" : "text-foreground/80"}`}
          >
            <Check
              className={`size-4 shrink-0 ${featured ? "text-chart-3" : "text-primary"}`}
            />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

function FinalCta() {
  return (
    <section className={`${SHELL} pt-10 pb-28 text-center`}>
      <h2 className="text-4xl font-extrabold tracking-tighter lg:text-[52px]">
        Commencez gratuitement.
      </h2>
      <p className="mx-auto mt-4 mb-7 max-w-xl text-lg text-muted-foreground">
        Une machine, sans carte bancaire. Vous connectez votre IA quand vous
        voulez.
      </p>
      <Button
        size="xl"
        render={<Link to="/app" />}
        nativeButton={false}
        className="shadow-[0_14px_30px_-12px] shadow-primary/60"
      >
        Créer mon compte
        <ArrowRight data-icon="inline-end" />
      </Button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div
        className={`${SHELL} flex flex-wrap items-center justify-between gap-4 py-7.5`}
      >
        <div className="flex items-center gap-2.5">
          <KovaLogo size={22} />
          <span className="text-base font-extrabold">Kova</span>
        </div>
        <div className="flex gap-5.5 text-[13.5px] text-muted-foreground">
          <span className="cursor-pointer hover:text-foreground">
            Confidentialité
          </span>
          <span className="cursor-pointer hover:text-foreground">Conditions</span>
          <span className="cursor-pointer hover:text-foreground">Contact</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground/80">
          © 2026 Kova
        </span>
      </div>
    </footer>
  );
}
