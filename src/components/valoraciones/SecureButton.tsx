
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface SecureButtonProps extends React.ComponentProps<typeof Button> {
  hasPermission: boolean;
  disabledReason?: string;
  showLockIcon?: boolean;
}

export function SecureButton({ 
  hasPermission, 
  disabledReason, 
  showLockIcon = true,
  children, 
  className = '',
  ...props 
}: SecureButtonProps) {
  if (!hasPermission) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              <Button
                {...props}
                disabled={true}
                className={`opacity-50 cursor-not-allowed ${className}`}
              >
                {showLockIcon && <Lock className="w-4 h-4 mr-1" />}
                {children}
              </Button>
            </div>
          </TooltipTrigger>
          {disabledReason && (
            <TooltipContent>
              <p className="max-w-48 text-center">{disabledReason}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button {...props} className={className}>
      {children}
    </Button>
  );
}
