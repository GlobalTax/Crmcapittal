import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SettingSection } from '@/components/settings/SettingSection';
import { Chrome, Mail, MoreHorizontal, Inbox } from 'lucide-react';

export default function EmailCalendarPage() {
  const [attioWatermark, setAttioWatermark] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = async (provider: string) => {
    setIsConnecting(provider);
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnecting(null);
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
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => handleConnect('google')}
              disabled={isConnecting === 'google'}
              className="flex-1 max-w-xs"
            >
              <Chrome className="h-4 w-4 mr-2" />
              {isConnecting === 'google' ? 'Connecting...' : 'Connect Google Account'}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => handleConnect('microsoft')}
              disabled={isConnecting === 'microsoft'}
              className="flex-1 max-w-xs"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isConnecting === 'microsoft' ? 'Connecting...' : 'Connect Microsoft Account'}
            </Button>
          </div>
          
          {/* Connected account example */}
          <div className="border border-border rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chrome className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">john.doe@company.com</div>
                  <div className="text-sm text-muted-foreground">Google Workspace</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-success border-success">
                  Connected
                </Badge>
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
          <div className="border border-border rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-md">
                  <Inbox className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">john.doe@mail.attio.com</div>
                  <div className="text-sm text-muted-foreground">Personal forwarding address</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary">
                  In Sync
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Copy address</DropdownMenuItem>
                    <DropdownMenuItem>Reset address</DropdownMenuItem>
                    <DropdownMenuItem>View logs</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection 
        title="Attio watermark"
        description="Control whether Attio branding appears in your outbound emails."
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Show Attio watermark</div>
            <div className="text-sm text-muted-foreground">
              Include "Sent via Attio" in your email signatures
            </div>
          </div>
          <Switch
            checked={attioWatermark}
            onCheckedChange={setAttioWatermark}
          />
        </div>
      </SettingSection>
    </div>
  );
}