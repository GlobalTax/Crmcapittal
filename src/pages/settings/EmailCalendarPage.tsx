import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SettingSection } from '@/components/settings/SettingSection';
import { ConnectButton } from '@/components/settings/ConnectButton';
import { StatusPill } from '@/components/settings/StatusPill';
import { Chrome, MoreHorizontal, Inbox, RefreshCw, Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts';

export default function EmailCalendarPage() {
  const [attioWatermark, setAttioWatermark] = useState(true);
  const { toast } = useToast();
  const {
    accounts,
    loading,
    connectAccount,
    disconnectAccount,
    syncAccount,
    isConnected,
    isTokenExpired,
  } = useConnectedAccounts();

  const handleConnect = (provider: 'google' | 'microsoft') => {
    connectAccount(provider);
  };

  const handleDisconnect = (accountId: string) => {
    disconnectAccount(accountId);
  };

  const handleSync = (accountId: string) => {
    syncAccount(accountId);
  };

  const handleWatermarkChange = async (checked: boolean) => {
    setAttioWatermark(checked);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast({
        title: "Saved ✓",
        description: "Watermark preference updated"
      });
    } catch (error) {
      setAttioWatermark(!checked);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">

      <SettingSection 
        title="Connected accounts"
        description="Connect your email and calendar providers to sync data automatically."
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <ConnectButton
              provider="google"
              onClick={() => handleConnect('google')}
              disabled={loading || isConnected('google')}
            />
            <ConnectButton
              provider="microsoft"
              onClick={() => handleConnect('microsoft')}
              disabled={loading || isConnected('microsoft')}
            />
          </div>
          
          {/* Connected Accounts List */}
          {accounts.length > 0 && (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Chrome className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{account.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.provider === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill 
                        status={isTokenExpired(account) ? "Expired" : "Connected"} 
                        variant={isTokenExpired(account) ? "error" : "success"} 
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSync(account.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync now
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDisconnect(account.id)}
                          >
                            <Unlink className="h-4 w-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {account.last_sync_at && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last synced: {new Date(account.last_sync_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingSection>

      <SettingSection 
        title="App watermark"
        description="Control whether branding appears in your outbound emails."
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Show app watermark</div>
            <div className="text-sm text-muted-foreground">
              Include "Sent via CRM Pro" in your email signatures
            </div>
          </div>
          <Switch
            checked={attioWatermark}
            onCheckedChange={handleWatermarkChange}
            aria-labelledby="watermark-label"
          />
        </div>
      </SettingSection>
    </div>
  );
}