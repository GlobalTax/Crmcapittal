
import { UnifiedCard } from "@/components/ui/unified-card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  textColor?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  bgColor,
  textColor
}: StatsCardProps) => {
  // Convert trend to diff format for UnifiedCard
  const diff = trend ? (trend.isPositive ? trend.value : -trend.value) : undefined;

  return (
    <UnifiedCard
      variant="stats"
      title={title}
      metric={value}
      description={description}
      icon={icon}
      diff={diff}
      className={bgColor}
    />
  );
};
