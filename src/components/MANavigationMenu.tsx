
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  FileText, 
  Search,
  TrendingUp,
  Building2,
  Target
} from "lucide-react";

export const MANavigationMenu = () => {
  const navigationItems = [
    {
      title: "Dashboard M&A",
      description: "Vista general de métricas y KPIs",
      icon: BarChart3,
      href: "/ma-dashboard",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Reportes",
      description: "Análisis detallados y reportes",
      icon: FileText,
      href: "/ma-reports",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Búsqueda Inteligente",
      description: "Encuentra oportunidades específicas",
      icon: Search,
      href: "/ma-search",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics M&A
        </h2>
        <p className="text-gray-600">
          Herramientas especializadas para fusiones y adquisiciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navigationItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mb-4`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {item.description}
                </p>
                <Button variant="outline" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">47</span>
            </div>
            <p className="text-sm text-gray-600">Deals Totales</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">12</span>
            </div>
            <p className="text-sm text-gray-600">Mandatos Activos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">67%</span>
            </div>
            <p className="text-sm text-gray-600">Tasa de Éxito</p>
          </div>
        </div>
      </div>
    </div>
  );
};
