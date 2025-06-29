
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Target, 
  Users, 
  Plus, 
  ArrowRight,
  BarChart3,
  FileText
} from "lucide-react";

interface QuickActionsProps {
  role?: string | null;
}

export const QuickActions = ({ role }: QuickActionsProps) => {
  const actions = [
    {
      title: "Explorar Portfolio",
      description: "Descubre oportunidades de inversión",
      icon: Building2,
      href: "/portfolio",
      color: "bg-blue-500 hover:bg-blue-600",
      show: true
    },
    {
      title: "Gestión de Sourcing",
      description: "Pipeline de empresas objetivo",
      icon: Target,
      href: "/sourcing",
      color: "bg-green-500 hover:bg-green-600",
      show: true
    },
    {
      title: "Gestionar Leads",
      description: "Administra leads entrantes",
      icon: Users,
      href: "/leads",
      color: "bg-orange-500 hover:bg-orange-600",
      show: role === 'admin' || role === 'superadmin'
    },
    {
      title: "Ver Proyectos",
      description: "Gestiona tus proyectos activos",
      icon: FileText,
      href: "/projects",
      color: "bg-purple-500 hover:bg-purple-600",
      show: true
    }
  ].filter(action => action.show);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {actions.map((action, index) => (
            <Link key={index} to={action.href} className="block">
              <div className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Quick Create Section */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Crear Nuevo</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button size="sm" className="justify-start h-auto p-3" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-xs">Operación</span>
            </Button>
            <Button size="sm" className="justify-start h-auto p-3" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-xs">Empresa</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
