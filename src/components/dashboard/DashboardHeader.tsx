
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  role: string | null;
}

export const DashboardHeader = ({ role }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard M&A</h1>
          <p className="text-gray-600 mt-1">
            Hola {user?.email?.split('@')[0] || 'Usuario'}, aquí tienes tu resumen de actividad
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-gray-300">
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300">
            Exportar
          </Button>
          <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
            {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
