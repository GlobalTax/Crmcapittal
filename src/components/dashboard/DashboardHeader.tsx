
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  role: string | null;
}

export const DashboardHeader = ({ role }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return null;
};

