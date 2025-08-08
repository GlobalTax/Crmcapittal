import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectButtonProps {
  provider: 'google' | 'microsoft';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const providerConfig = {
  google: {
    icon: Mail,
    label: 'Connect Google Account',
    connectingLabel: 'Connecting to Google...'
  },
  microsoft: {
    icon: Calendar,
    label: 'Connect Microsoft Account', 
    connectingLabel: 'Connecting to Microsoft...'
  }
};

export const ConnectButton = ({ 
  provider, 
  onClick, 
  disabled, 
  className 
}: ConnectButtonProps) => {
  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 max-w-xs bg-transparent border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <Icon className="h-4 w-4 mr-2" />
      {disabled ? config.connectingLabel : config.label}
    </Button>
  );
};