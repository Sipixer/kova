import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  ListOrdered,
  MonitorSmartphone,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import { KovaLogo } from "@/components/kova-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const NAV = [
  { to: "/app", label: "Accueil", icon: Home, exact: true },
  { to: "/app/recherche", label: "Recherche", icon: Search },
  { to: "/app/timeline", label: "Timeline", icon: ListOrdered },
  { to: "/app/machines", label: "Machines", icon: MonitorSmartphone },
  { to: "/app/ia", label: "Connexion IA", icon: Sparkles },
  { to: "/app/reglages", label: "Réglages", icon: Settings },
] as const;

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <KovaLogo size={26} />
          <span className="text-lg font-extrabold tracking-tight group-data-[collapsible=icon]:hidden">
            Kova
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.to
                  : pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link to={item.to} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2.5 p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <Avatar className="size-9 rounded-lg group-data-[collapsible=icon]:size-8">
            <AvatarFallback className="rounded-lg bg-primary font-bold text-primary-foreground">
              LV
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-[13.5px] font-semibold">Léa Vidal</div>
            <div className="text-[11.5px] text-muted-foreground">
              Plan gratuit
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
