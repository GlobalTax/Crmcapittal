
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Target,
  Building,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Menu,
  X,
  DollarSign,
  UserCheck,
  GitBranch,
  Layers,
  Shield,
  Clock,
  Briefcase
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/",
      color: "text-sky-500",
    },
    {
      label: "Negocios",
      icon: Briefcase,
      href: "/negocios",
      color: "text-violet-500",
    },
    {
      label: "Operaciones",
      icon: Target,
      href: "/operaciones",
      color: "text-pink-700",
    },
    {
      label: "Portfolio",
      icon: TrendingUp,
      href: "/portfolio",
      color: "text-orange-700",
    },
    {
      label: "Empresas",
      icon: Building,
      href: "/companies",
      color: "text-emerald-500",
    },
    {
      label: "Contactos",
      icon: Users,
      href: "/contacts",
      color: "text-green-700",
    },
    {
      label: "Leads",
      icon: UserCheck,
      href: "/leads",
      color: "text-blue-600",
    },
    {
      label: "Pipeline",
      icon: GitBranch,
      href: "/pipeline",
      color: "text-purple-600",
    },
    {
      label: "Pipelines",
      icon: Layers,
      href: "/pipelines",
      color: "text-indigo-600",
    },
    {
      label: "Sourcing",
      icon: DollarSign,
      href: "/sourcing",
      color: "text-yellow-600",
    },
    {
      label: "Calendario",
      icon: Calendar,
      href: "/calendar",
      color: "text-teal-600",
    },
    {
      label: "Tiempo",
      icon: Clock,
      href: "/time-tracking",
      color: "text-cyan-600",
    },
    {
      label: "Admin",
      icon: Shield,
      href: "/admin",
      color: "text-red-600",
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/settings",
      color: "text-gray-600",
    }
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            M&A Platform
          </h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-3 pr-3 py-2 rounded-lg hover:text-slate-600 hover:bg-slate-100/50 transition-all",
                location.pathname === route.href && "text-slate-700 bg-slate-200/50",
                collapsed && "justify-center px-2"
              )}
            >
              <route.icon className={`h-5 w-5 ${route.color}`} />
              {!collapsed && <span>{route.label}</span>}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
