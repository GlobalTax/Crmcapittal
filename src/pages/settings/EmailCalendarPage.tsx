import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SettingSection } from '@/components/settings/SettingSection';
import { ConnectButton } from '@/components/settings/ConnectButton';
import { StatusPill } from '@/components/settings/StatusPill';
import { OAuthStubModal } from '@/components/settings/OAuthStubModal';
import { Chrome, MoreHorizontal, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function EmailCalendarPage() {
  const [attioWatermark, setAttioWatermark] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [oauthModal, setOauthModal] = useState<{ open: boolean; provider: 'google' | 'microsoft' | null }>({
    open: false,
    provider: null
  });
  const { toast } = useToast();

  const handleConnect = (provider: 'google' | 'microsoft') => {
    setOauthModal({ open: true, provider });
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
      <div>
        <h1 className="text-2xl font-semibold">Email & calendar accounts</h1>
        <p className="text-muted-foreground mt-1">
          Manage and sync your email and calendar accounts to streamline your workflow.
        </p>
      </div>

      <SettingSection 
        title="Connected accounts"
        description="Connect your email and calendar providers to sync data automatically."
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <ConnectButton
              provider="google"
              onClick={() => handleConnect('google')}
              disabled={isConnecting === 'google'}
            />
            <ConnectButton
              provider="microsoft"
              onClick={() => handleConnect('microsoft')}
              disabled={isConnecting === 'microsoft'}
            />
          </div>
          
          {/* Connected account example */}
          <div className="border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chrome className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">john.doe@company.com</div>
                  <div className="text-sm text-muted-foreground">Google Workspace</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status="Connected" variant="success" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Sync now</DropdownMenuItem>
                    <DropdownMenuItem>View settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Disconnect</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection 
        title="Forwarding address"
        description="Send emails to your contacts using your personal forwarding address."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 border border-border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
              <div>
                <div className="font-medium font-mono">capital@tuapp.email</div>
                <div className="text-sm text-muted-foreground">Personal forwarding address</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status="In Sync" variant="info" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Disable</DropdownMenuItem>
                  <DropdownMenuItem>Regenerate alias</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
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

      <OAuthStubModal
        open={oauthModal.open}
        onOpenChange={(open) => setOauthModal({ open, provider: null })}
        provider={oauthModal.provider!}
      />
    </div>
  );
}