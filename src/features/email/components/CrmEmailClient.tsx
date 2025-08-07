import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Search, Plus } from 'lucide-react';
import { CrmEmailFolders } from './CrmEmailFolders';
import { CrmEmailList } from './CrmEmailList';
import { CrmEmailPreview } from './CrmEmailPreview';
import { IntelligentCompose } from './IntelligentCompose';
import { EmailFilter, Email } from '../types';
import { useEmailAccounts } from '../hooks/useEmailAccounts';

export const CrmEmailClient: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedEmailData, setSelectedEmailData] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const { data: accounts = [] } = useEmailAccounts();

  // Mock folder counts - these would come from actual queries
  const folderCounts = {
    inbox: 12,
    sent: 45,
    crmLinked: 8,
    templates: 5,
    scheduled: 2,
    starred: 3,
    deals: 6,
    archived: 24
  };

  const getEmailFilter = (): EmailFilter => {
    switch (activeFolder) {
      case 'inbox':
        return { direction: 'incoming' };
      case 'sent':
        return { direction: 'outgoing' };
      case 'crm-linked':
        return { 
          direction: 'incoming',
          // Add filter for emails with CRM context
        };
      case 'starred':
        return { is_starred: true };
      case 'deals':
        return { 
          // Filter for emails linked to deals
        };
      default:
        return { direction: 'incoming' };
    }
  };

  const handleEmailSelect = (emailId: string, email: Email) => {
    setSelectedEmail(emailId);
    setSelectedEmailData(email);
  };

  const handleCompose = () => {
    setIsComposing(true);
    setSelectedEmail(null);
    setSelectedEmailData(null);
  };

  if (isComposing) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Email CRM</h1>
            </div>
            <Button variant="ghost" onClick={() => setIsComposing(false)}>
              Cancelar
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <IntelligentCompose
            onCancel={() => setIsComposing(false)}
            onSent={() => setIsComposing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Email CRM</h1>
          </div>
          
          <div className="flex items-center gap-3">
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
              onClick={handleCompose}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Redactar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 20% - Folders Sidebar */}
        <CrmEmailFolders
          activeFolder={activeFolder}
          onFolderChange={setActiveFolder}
          folderCounts={folderCounts}
        />

        {/* 50% - Email List */}
        <div className="w-1/2 border-r">
          <CrmEmailList
            searchQuery={searchQuery}
            filter={getEmailFilter()}
            selectedEmail={selectedEmail}
            onEmailSelect={handleEmailSelect}
          />
        </div>

        {/* 30% - Preview/Compose */}
        <div className="flex-1">
          <CrmEmailPreview
            email={selectedEmailData}
            onClose={() => {
              setSelectedEmail(null);
              setSelectedEmailData(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};