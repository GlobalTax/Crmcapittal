
import React, { useState } from 'react';
import { EmailSidebar } from '@/components/email/EmailSidebar';
import { EmailList } from '@/components/email/EmailList';
import { EmailViewer } from '@/components/email/EmailViewer';
import { EmailComposer } from '@/components/email/EmailComposer';
import { EmailConfigDialog } from '@/components/email/EmailConfigDialog';
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { useNylasAccounts } from '@/hooks/useNylasAccounts';
import { TrackedEmail } from '@/types/EmailTracking';
import { useToast } from '@/hooks/use-toast';

export default function Email() {
  const [selectedEmail, setSelectedEmail] = useState<TrackedEmail | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  
  const { accounts, isLoading: accountsLoading } = useNylasAccounts();
  const { toast } = useToast();

  // Check if user has configured email accounts
  const hasConfiguredAccounts = accounts && accounts.length > 0;
  
  // Only use email tracking when accounts are configured
  const { emails, isLoading, error } = useEmailTracking({
    enabled: hasConfiguredAccounts
  });

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
      {!hasConfiguredAccounts ? (
        /* Estado inicial: Configurar Nylas */
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center max-w-lg p-8">
            <div className="mb-8">
              <div className="mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Sistema de Email con Nylas
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Conecta tu cuenta de DonDominio para empezar a gestionar tus emails de forma profesional
              </p>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <EmailConfigDialog />
              </div>
              <div className="text-sm text-gray-500">
                <p className="mb-2">✓ Sincronización automática con Nylas</p>
                <p className="mb-2">✓ Gestión profesional de emails</p>
                <p>✓ Compatible con DonDominio y otros proveedores</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Estado normal: Con cuentas configuradas */
        <>
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Email</h1>
              <EmailConfigDialog />
            </div>
          </div>

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
        </>
      )}

      {/* Modal del compositor */}
      <EmailComposer
        isOpen={isComposerOpen}
        onClose={handleCloseComposer}
        recipientEmail={selectedEmail?.recipient_email}
      />
    </div>
  );
}
