import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Search, 
  Filter, 
  Star, 
  Archive, 
  Trash2, 
  Plus,
  Inbox,
  Send,
  FileText,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';
import { EmailInbox } from './EmailInbox';
import { EmailCompose } from './EmailCompose';
import { EmailSettings } from './EmailSettings';
import { EmailTemplates } from './EmailTemplates';
import { EmailAnalytics } from './EmailAnalytics';
import { useEmailAccounts } from '../hooks/useEmailAccounts';

export const EmailClient: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  
  const { data: accounts = [] } = useEmailAccounts();

  const tabs = [
    { id: 'inbox', label: 'Bandeja de entrada', icon: Inbox, count: 12 },
    { id: 'sent', label: 'Enviados', icon: Send, count: 0 },
    { id: 'templates', label: 'Templates', icon: FileText, count: 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: 0 },
    { id: 'settings', label: 'Configuración', icon: Settings, count: 0 },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Email CRM</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button 
              onClick={() => setIsComposing(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Redactar
            </Button>
          </div>
        </div>

        {accounts.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Cuentas:</span>
            {accounts.map((account: any) => (
              <Badge 
                key={account.id} 
                variant={account.is_default ? "default" : "secondary"}
                className="text-xs"
              >
                {account.email_address}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/20 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComponent className="h-4 w-4 mr-3" />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge className="ml-auto" variant="secondary">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Quick Filters */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">Filtros rápidos</p>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Star className="h-4 w-4 mr-3" />
              Destacados
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Users className="h-4 w-4 mr-3" />
              CRM Vinculados
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              <Archive className="h-4 w-4 mr-3" />
              Archivados
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'inbox' && (
            <EmailInbox 
              searchQuery={searchQuery}
              filter={{ direction: 'incoming' }}
            />
          )}
          
          {activeTab === 'sent' && (
            <EmailInbox 
              searchQuery={searchQuery}
              filter={{ direction: 'outgoing' }}
            />
          )}
          
          {activeTab === 'templates' && <EmailTemplates />}
          {activeTab === 'analytics' && <EmailAnalytics />}
          {activeTab === 'settings' && <EmailSettings />}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <EmailCompose 
          isOpen={isComposing}
          onClose={() => setIsComposing(false)}
        />
      )}
    </div>
  );
};