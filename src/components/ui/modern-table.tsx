import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernTableProps {
  children: ReactNode;
  className?: string;
}

interface ModernTableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface ModernTableBodyProps {
  children: ReactNode;
  className?: string;
}

interface ModernTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

interface ModernTableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

export function ModernTable({ children, className }: ModernTableProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </Card>
  );
}

export function ModernTableHeader({ children, className }: ModernTableHeaderProps) {
  return (
    <thead className={cn("bg-muted/50", className)}>
      {children}
    </thead>
  );
}

export function ModernTableBody({ children, className }: ModernTableBodyProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

export function ModernTableRow({ 
  children, 
  className, 
  onClick, 
  isClickable 
}: ModernTableRowProps) {
  return (
    <tr 
      className={cn(
        "border-b border-border last:border-b-0",
        isClickable && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function ModernTableCell({ 
  children, 
  className, 
  header = false 
}: ModernTableCellProps) {
  const Component = header ? 'th' : 'td';
  
  return (
    <Component 
      className={cn(
        "px-6 py-4 text-left",
        header 
          ? "text-sm font-medium text-muted-foreground" 
          : "text-sm text-foreground",
        className
      )}
    >
      {children}
    </Component>
  );
}