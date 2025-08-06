import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "bg-white border border-gray-200 transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "rounded-lg",
        stats: "rounded-lg",
        metric: "rounded-lg",
        compact: "rounded-lg",
        chart: "rounded-lg"
      },
      padding: {
        default: "p-6",
        compact: "p-4",
        large: "p-8"
      },
      hover: {
        true: "hover:bg-gray-50 cursor-pointer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
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
  ({ className, variant, padding, hover, title, description, icon: Icon, metric, diff, children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(cardVariants({ variant, padding, hover, className }))} 
        {...props}
      >
        {/* Header with title, icon, and metric */}
        {(title || Icon || metric) && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {metric && (
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {metric}
                </div>
              )}
              {description && (
                <p className="text-base text-gray-700 mt-1">
                  {description}
                </p>
              )}
              {diff !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  <span 
                    className={cn(
                      "text-sm font-medium flex items-center",
                      diff >= 0 ? "text-gray-700" : "text-gray-700"
                    )}
                  >
                    {diff >= 0 ? "↗" : "↘"}
                    <span className="ml-1">
                      {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
                    </span>
                  </span>
                  <span className="text-sm text-gray-600">vs mes anterior</span>
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
          <div className="gap-4 flex flex-col">
            {children}
          </div>
        )}
      </div>
    );
  }
);

UnifiedCard.displayName = "UnifiedCard";

export { cardVariants };