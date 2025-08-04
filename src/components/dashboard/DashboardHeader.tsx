
import { useState } from "react";
import { useAuth } from "@/stores/useAuthStore";
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
          <h1 className="text-sm font-semibold text-gray-900">Dashboard M&A</h1>
          <p className="text-gray-600 mt-1">
            Hola {user?.email?.split('@')[0] || 'Usuario'}, aquí tienes tu resumen de actividad
          </p>
        </div>
        <div className="flex items-center">
          <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
            {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
