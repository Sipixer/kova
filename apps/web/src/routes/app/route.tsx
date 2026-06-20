import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <AppTopbar />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="-ml-1 size-9 shrink-0 text-muted-foreground hover:text-foreground" />
      <div className="flex w-full max-w-[560px] items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5">
        <Search className="size-[18px] shrink-0 text-muted-foreground" />
        <input
          placeholder="Cherchez dans votre mémoire…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          ⌘K
        </span>
      </div>
    </header>
  );
}
