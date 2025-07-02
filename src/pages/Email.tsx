
import React, { useState } from 'react';
import { EmailSidebar } from '@/components/email/EmailSidebar';
import { EmailList } from '@/components/email/EmailList';
import { EmailViewer } from '@/components/email/EmailViewer';
import { EmailComposer } from '@/components/email/EmailComposer';
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { TrackedEmail } from '@/types/EmailTracking';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '@/components/email/email-styles.css';

export default function Email() {
  const [selectedEmail, setSelectedEmail] = useState<TrackedEmail | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  
  const { emails, isLoading, error } = useEmailTracking();
  const { toast } = useToast();

  const handleEmailSelect = (email: TrackedEmail) => {
    setSelectedEmail(email);
  };

  const handleCompose = () => {
    setIsComposerOpen(true);
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
  };

  const handleReply = () => {
    if (selectedEmail) {
      setIsComposerOpen(true);
    }
  };

  const handleArchive = () => {
    if (selectedEmail) {
      toast({
        title: "Funcionalidad no disponible",
        description: "La función de archivar estará disponible próximamente.",
      });
    }
  };

  const handleDelete = () => {
    if (selectedEmail) {
      toast({
        title: "Funcionalidad no disponible",
        description: "La función de eliminar estará disponible próximamente.",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error cargando los datos del email. Por favor, actualiza la página o inténtalo más tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background p-4">
        <h1 className="text-2xl font-bold">Sistema de Email</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona y rastrea tus emails de manera eficiente
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="min-w-[250px]">
            <EmailSidebar
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
              onCompose={handleCompose}
              emailCounts={{
                inbox: emails?.length || 0,
                sent: emails?.filter(e => e.status === 'SENT').length || 0,
                unread: emails?.filter(e => e.status !== 'OPENED').length || 0
              }}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Email List */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <EmailList
              emails={emails || []}
              selectedEmail={selectedEmail}
              onEmailSelect={handleEmailSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFolder={selectedFolder}
              isLoading={isLoading}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Email Viewer */}
          <ResizablePanel defaultSize={45} minSize={30}>
            <EmailViewer
              email={selectedEmail}
              onReply={handleReply}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

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
