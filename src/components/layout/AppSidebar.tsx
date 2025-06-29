
import React from "react";
import { Calendar, Clock, Users, Building2, Target, BarChart3, Settings, FileText, MessageSquare, Timer } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Dashboard",
    items: [
      { title: "Inicio", url: "/", icon: BarChart3, roles: ["user", "admin", "superadmin"] },
      { title: "Mi Día", url: "/time-tracking", icon: Timer, roles: ["user", "admin", "superadmin"] },
    ],
  },
  {
    title: "Gestión",
    items: [
      { title: "Operaciones", url: "/portfolio", icon: Building2, roles: ["user", "admin", "superadmin"] },
      { title: "Sourcing", url: "/sourcing", icon: Target, roles: ["user", "admin", "superadmin"] },
      { title: "Leads", url: "/leads", icon: MessageSquare, roles: ["user", "admin", "superadmin"] },
      { title: "Proyectos", url: "/projects", icon: FileText, roles: ["user", "admin", "superadmin"] },
    ],
  },
  {
    title: "Administración",
    items: [
      { title: "Managers", url: "/managers", icon: Users, roles: ["admin", "superadmin"] },
      { title: "Admin Panel", url: "/admin", icon: Settings, roles: ["admin", "superadmin"] },
      { title: "Super Admin", url: "/super-admin", icon: Settings, roles: ["superadmin"] },
    ],
  },
];

export function AppSidebar() {
  const { role } = useUserRole();

  const filteredNavigation = navigation.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.roles.includes(role || 'user')
    )
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar>
      <SidebarContent>
        {filteredNavigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
