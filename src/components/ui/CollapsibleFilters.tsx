import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollapsibleFiltersProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleFilters({ 
  children, 
  title = "Filtros", 
  defaultOpen = false,
  className 
}: CollapsibleFiltersProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border border-gray-100 rounded-lg bg-white", className)}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between p-4 h-auto font-medium text-gray-700 hover:bg-gray-50"
      >
        <span className="text-sm">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </Button>
      
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-50">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}