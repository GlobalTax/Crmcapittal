import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CollapsibleFormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleFormSection = ({
  title,
  icon,
  children,
  defaultOpen = false,
  className = ""
}: CollapsibleFormSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-0 h-auto font-medium text-gray-700 hover:text-gray-900"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm">{title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};