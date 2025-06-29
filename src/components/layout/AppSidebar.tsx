
import { NavLink, useLocation } from "react-router-dom";
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
import { useUserRole } from "@/hooks/useUserRole";
import {
  Home,
  Activity,
  User,
  Settings,
  Users,
  Bell,
  Grid,
} from "lucide-react";

const navigationItems = {
  user: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Portfolio", url: "/portfolio", icon: Grid },
  ],
  admin: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Portfolio", url: "/portfolio", icon: Grid },
    { title: "Operaciones", url: "/admin", icon: Activity },
    { title: "Leads", url: "/leads", icon: Bell },
    { title: "Proyectos", url: "/projects", icon: Settings },
  ],
  superadmin: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Portfolio", url: "/portfolio", icon: Grid },
    { title: "Operaciones", url: "/admin", icon: Activity },
    { title: "Leads", url: "/leads", icon: Bell },
    { title: "Proyectos", url: "/projects", icon: Settings },
    { title: "Managers", url: "/managers", icon: Users },
    { title: "Super Admin", url: "/superadmin", icon: User },
  ],
};

export const AppSidebar = () => {
  const { role } = useUserRole();
  const location = useLocation();
  
  const items = role ? navigationItems[role] || navigationItems.user : navigationItems.user;
  
  const isActive = (url: string) => {
    if (url === "/" && location.pathname === "/") return true;
    if (url !== "/" && location.pathname.startsWith(url)) return true;
    return false;
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
