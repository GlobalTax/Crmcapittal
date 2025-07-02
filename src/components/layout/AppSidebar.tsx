
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
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Home,
  FolderOpen,
  UserCheck,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  Target,
  Workflow,
  Building2,
  UserPlus,
  Briefcase,
  Scale
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const menuItems = [
  {
    title: "General",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "Mi Día", url: "/my-day", icon: Calendar },
      { title: "Time Tracking", url: "/time-tracking", icon: Clock },
    ]
  },
  {
    title: "CRM & Ventas",
    items: [
      { title: "Empresas", url: "/companies", icon: Building2 },
      { title: "Contactos", url: "/contacts", icon: Users },
      { title: "Control Leads", url: "/leads", icon: UserPlus },
      { title: "Negocios", url: "/deals", icon: Briefcase },
      { title: "Pipelines", url: "/pipelines", icon: Workflow },
    ]
  },
  {
    title: "Legal & Casos",
    items: [
      { title: "Expedientes", url: "/cases", icon: Scale },
    ]
  },
  {
    title: "Operaciones",
    items: [
      { title: "Portfolio", url: "/portfolio", icon: BarChart3 },
      { title: "Operaciones", url: "/operaciones", icon: Briefcase },
      { title: "Sourcing", url: "/sourcing", icon: Target },
      { title: "Proyectos", url: "/projects", icon: FolderOpen },
    ]
  },
  {
    title: "Gestión",
    items: [
      { title: "Managers", url: "/managers", icon: UserCheck },
    ]
  },
  {
    title: "Administración",
    items: [
      { title: "Admin", url: "/admin", icon: Shield, roles: ['admin', 'superadmin'] },
      { title: "Super Admin", url: "/super-admin", icon: ShieldCheck, roles: ['superadmin'] },
    ]
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { role } = useUserRole();

  const hasAccess = (itemRoles?: string[]) => {
    if (!itemRoles) return true;
    return itemRoles.includes(role || '');
  };

  return (
    <Sidebar>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (!hasAccess(item.roles)) return null;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon />
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
