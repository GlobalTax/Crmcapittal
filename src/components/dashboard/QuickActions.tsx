
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {actions.map((action, index) => {
            if ((action.href === '/leads' || action.href === '/admin') && role === 'user') return null;
            
            return (
              <Link key={index} to={action.href}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <action.icon className="h-4 w-4 mr-3" />
                  {action.title}
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
