
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  role: string | null;
}

export const DashboardHeader = ({ role }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Personal</h1>
        <div className="flex items-center">
          <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
            {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </div>
      </div>
    </div>
  );
};
