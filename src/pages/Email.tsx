
import React, { useState } from 'react';
import { EmailSidebar } from '@/components/email/EmailSidebar';
import { EmailList } from '@/components/email/EmailList';
import { EmailViewer } from '@/components/email/EmailViewer';
import { EmailComposer } from '@/components/email/EmailComposer';
import { EmailConfigDialog } from '@/components/email/EmailConfigDialog';
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { TrackedEmail } from '@/types/EmailTracking';
import { useToast } from '@/hooks/use-toast';

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
        <div className="text-center">
          <p className="text-red-600 mb-2">Error cargando los datos del email</p>
          <p className="text-sm text-gray-500">Por favor, actualiza la página o inténtalo más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header limpio */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Sistema de Email</h1>
          <EmailConfigDialog />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white">
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
        </div>

        {/* Lista de emails */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <EmailList
            emails={emails || []}
            selectedEmail={selectedEmail}
            onEmailSelect={handleEmailSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFolder={selectedFolder}
            isLoading={isLoading}
          />
        </div>

        {/* Visor de email */}
        <div className="flex-1 bg-white">
          <EmailViewer
            email={selectedEmail}
            onReply={handleReply}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modal del compositor */}
      <EmailComposer
        isOpen={isComposerOpen}
        onClose={handleCloseComposer}
        recipientEmail={selectedEmail?.recipient_email}
      />
    </div>
  );
}
