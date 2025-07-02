
import React, { useState } from 'react';
import { EmailSidebar } from '@/components/email/EmailSidebar';
import { EmailList } from '@/components/email/EmailList';
import { EmailViewer } from '@/components/email/EmailViewer';
import { EmailComposer } from '@/components/email/EmailComposer';
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { TrackedEmail } from '@/types/EmailTracking';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export default function Email() {
  const [selectedEmail, setSelectedEmail] = useState<TrackedEmail | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  
  const { emails, isLoading } = useEmailTracking();

  const handleEmailSelect = (email: TrackedEmail) => {
    setSelectedEmail(email);
  };

  const handleCompose = () => {
    setIsComposerOpen(true);
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <EmailSidebar
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
            onCompose={handleCompose}
            emailCounts={{
              inbox: emails.length,
              sent: emails.filter(e => e.status === 'SENT').length,
              unread: emails.filter(e => e.status !== 'OPENED').length
            }}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Email List */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <EmailList
            emails={emails}
            selectedEmail={selectedEmail}
            onEmailSelect={handleEmailSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFolder={selectedFolder}
            isLoading={isLoading}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Email Viewer */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <EmailViewer
            email={selectedEmail}
            onReply={() => setIsComposerOpen(true)}
            onArchive={() => {}}
            onDelete={() => {}}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Email Composer Modal */}
      {isComposerOpen && (
        <EmailComposer
          trigger={null}
          recipientEmail={selectedEmail?.recipient_email}
          onClose={handleCloseComposer}
        />
      )}
    </div>
  );
}
