import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/timeline")({
  component: Timeline,
});

function Timeline() {
  return (
    <div className="px-4 py-8 sm:px-10">
      <h1 className="text-[28px] font-extrabold tracking-tight">Timeline</h1>
      <p className="mt-1.5 text-[15px] text-muted-foreground">Bientôt.</p>
    </div>
  );
}
