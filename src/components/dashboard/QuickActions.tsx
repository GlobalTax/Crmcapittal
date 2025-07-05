
import { DashboardCard } from "./DashboardCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  title: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  role: string | null;
}

export const QuickActions = ({ actions, role }: QuickActionsProps) => {
  return (
    <DashboardCard title="Acciones Rápidas">
      <div className="space-y-2">
        {actions.map((action, index) => {
          if ((action.href === '/leads' || action.href === '/admin') && role === 'user') return null;
          
          return (
            <Link key={index} to={action.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-accent hover:text-primary"
              >
                <action.icon className="h-4 w-4 mr-3" />
                {action.title}
              </Button>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
};
