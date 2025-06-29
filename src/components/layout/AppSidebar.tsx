
import React from "react";
import { Calendar, Clock, Users, Building2, Target, BarChart3, Settings, FileText, MessageSquare } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Link, useLocation } from "react-router-dom";
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
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "DASHBOARD",
    items: [
      { title: "Inicio", url: "/", icon: BarChart3, roles: ["user", "admin", "superadmin"] },
      { title: "Mi Día", url: "/my-day", icon: Calendar, roles: ["user", "admin", "superadmin"] },
      { title: "Time Tracking", url: "/time-tracking", icon: Clock, roles: ["user", "admin", "superadmin"] },
    ],
  },
  {
    title: "GESTIÓN",
    items: [
      { title: "Operaciones", url: "/portfolio", icon: Building2, roles: ["user", "admin", "superadmin"] },
      { title: "Sourcing", url: "/sourcing", icon: Target, roles: ["user", "admin", "superadmin"] },
      { title: "Leads", url: "/leads", icon: MessageSquare, roles: ["user", "admin", "superadmin"] },
      { title: "Proyectos", url: "/projects", icon: FileText, roles: ["user", "admin", "superadmin"] },
    ],
  },
  {
    title: "ADMINISTRACIÓN",
    items: [
      { title: "Managers", url: "/managers", icon: Users, roles: ["admin", "superadmin"] },
      { title: "Admin Panel", url: "/admin", icon: Settings, roles: ["admin", "superadmin"] },
      { title: "Super Admin", url: "/super-admin", icon: Settings, roles: ["superadmin"] },
    ],
  },
];

export function AppSidebar() {
  const { role } = useUserRole();
  const location = useLocation();

  const filteredNavigation = navigation.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.roles.includes(role || 'user')
    )
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar className="bg-white border-r border-slate-200">
      <SidebarContent className="px-3 py-6">
        {filteredNavigation.map((group) => (
          <SidebarGroup key={group.title} className="mb-6">
            <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        className={cn(
                          "group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors",
                          isActive 
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 ml-[-12px] pl-[8px]" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-x-3 w-full">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
