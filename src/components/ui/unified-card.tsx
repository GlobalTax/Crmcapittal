import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "bg-white border border-gray-200 shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "rounded-lg p-6",
        stats: "rounded-lg p-6",
        metric: "rounded-lg p-6 hover:shadow-sm",
        compact: "rounded-lg p-4",
        chart: "rounded-lg p-6"
      },
      hover: {
        true: "hover:shadow-sm cursor-pointer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      hover: false
    }
  }
);

interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  metric?: string | number;
  diff?: number;
  children?: React.ReactNode;
}

export const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ className, variant, hover, title, description, icon: Icon, metric, diff, children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(cardVariants({ variant, hover, className }))} 
        {...props}
      >
        {/* Header with title, icon, and metric */}
        {(title || Icon || metric) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-sm font-medium text-gray-700 truncate leading-tight">
                  {title}
                </h3>
              )}
              {metric && (
                <div className="text-3xl font-bold text-gray-900 mt-1 leading-tight">
                  {metric}
                </div>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
              {diff !== undefined && (
                <div className="flex items-center mt-2">
                  <span 
                    className={cn(
                      "text-sm font-medium flex items-center",
                      diff >= 0 ? "text-gray-600" : "text-gray-600"
                    )}
                  >
                    {diff >= 0 ? "↗" : "↘"}
                    <span className="ml-1">
                      {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
                    </span>
                  </span>
                  <span className="text-sm text-gray-600 ml-1">vs mes anterior</span>
                </div>
              )}
            </div>
            
            {Icon && (
              <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        {children && (
          <div className="space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  }
);

UnifiedCard.displayName = "UnifiedCard";

export { cardVariants };