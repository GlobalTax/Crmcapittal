import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, CheckCircle } from 'lucide-react';

interface OAuthStubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: 'google' | 'microsoft';
}

const providerConfig = {
  google: {
    icon: Mail,
    name: 'Google',
    description: 'Connect your Google account to sync emails and calendar events.'
  },
  microsoft: {
    icon: Calendar,
    name: 'Microsoft',
    description: 'Connect your Microsoft account to sync Outlook emails and calendar events.'
  }
};

export const OAuthStubModal = ({ open, onOpenChange, provider }: OAuthStubModalProps) => {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  
  const config = providerConfig[provider];
  const Icon = config.icon;

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnecting(false);
    setIsConnected(true);
    
    // Auto close after success
    setTimeout(() => {
      onOpenChange(false);
      setIsConnected(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Connect {config.name}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 pt-4">
          {isConnected ? (
            <div className="flex items-center justify-center gap-2 text-success p-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Successfully connected!</span>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                This is a demo. In a real application, this would redirect you to {config.name}'s OAuth page.
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1"
                >
                  {isConnecting ? 'Connecting...' : `Connect ${config.name}`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isConnecting}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};