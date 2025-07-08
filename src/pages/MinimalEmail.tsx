
import { useState } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { Mail } from 'lucide-react';
import { TrackedEmail } from '@/types/EmailTracking';
import { EmailComposer } from '@/components/email/EmailComposer';
import DOMPurify from 'dompurify';

export default function MinimalEmail() {
  const [selectedEmail, setSelectedEmail] = useState<TrackedEmail | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  
  const { emails, isLoading, error } = useEmailTracking();

  const handleEmailSelect = (email: TrackedEmail) => {
    setSelectedEmail(email);
  };

  const handleCompose = () => {
    setIsComposerOpen(true);
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
  };

  const getStatusIndicator = (status: string) => {
    const colors = {
      SENT: 'bg-blue-500',
      DELIVERED: 'bg-green-500', 
      OPENED: 'bg-green-500',
      CLICKED: 'bg-green-500',
      BOUNCED: 'bg-red-500',
      COMPLAINED: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEmails = emails?.filter(email => {
    const matchesSearch = !searchQuery || 
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'inbox' || 
                         (selectedFolder === 'sent' && email.status === 'SENT') ||
                         (selectedFolder === 'unread' && email.status !== 'OPENED');
    return matchesSearch && matchesFolder;
  }) || [];

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error cargando emails</p>
          <p className="text-sm text-gray-500">Intenta recargar la página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header simple */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light text-gray-900">Email</h1>
        <Button variant="primary" onClick={handleCompose}>
          Redactar
        </Button>
      </div>

      {/* Navegación simple */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setSelectedFolder('inbox')}
          className={`px-4 py-2 text-sm transition-colors ${
            selectedFolder === 'inbox' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => setSelectedFolder('sent')}
          className={`px-4 py-2 text-sm transition-colors ${
            selectedFolder === 'sent' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Enviados
        </button>
        <button
          onClick={() => setSelectedFolder('unread')}
          className={`px-4 py-2 text-sm transition-colors ${
            selectedFolder === 'unread' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          No leídos
        </button>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm ml-auto block px-3 py-2 text-sm border-b border-gray-200 focus:border-gray-400 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Lista de emails */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Cargando...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">No hay emails</p>
              <p className="text-sm text-gray-500">
                {searchQuery ? "Intenta con otros términos" : "Envía tu primer email"}
              </p>
            </div>
          ) : (
            <div className="space-y-px">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 cursor-pointer transition-colors border-l-2 ${
                    selectedEmail?.id === email.id 
                      ? 'bg-gray-50 border-gray-900' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                  onClick={() => handleEmailSelect(email)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusIndicator(email.status)}`}></div>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {email.recipient_email}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(email.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 truncate mb-1">
                    {email.subject || 'Sin asunto'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {email.content?.replace(/<[^>]*>/g, '').substring(0, 80) || 'Sin contenido'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle del email */}
        <div className="flex-1">
          {selectedEmail ? (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedEmail.subject || 'Sin asunto'}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {formatDate(selectedEmail.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Para: {selectedEmail.recipient_email}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${getStatusIndicator(selectedEmail.status)}`}></div>
                  <span className="text-xs text-gray-500">
                    {selectedEmail.status === 'SENT' && 'Enviado'}
                    {selectedEmail.status === 'OPENED' && 'Abierto'}
                    {selectedEmail.status === 'CLICKED' && 'Clic'}
                  </span>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(selectedEmail.content || 'Sin contenido')
                  }}
                />
              </div>

              {selectedEmail.opened_at && (
                <div className="bg-green-50 p-3 text-sm">
                  <p className="text-green-800">
                    Abierto el {formatDate(selectedEmail.opened_at)}
                  </p>
                  {selectedEmail.open_count > 1 && (
                    <p className="text-green-700 text-xs">
                      {selectedEmail.open_count} veces
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button variant="primary" size="sm">
                  Responder
                </Button>
                <Button variant="ghost" size="sm">
                  Reenviar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm">Selecciona un email</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <EmailComposer
        isOpen={isComposerOpen}
        onClose={handleCloseComposer}
        recipientEmail={selectedEmail?.recipient_email}
      />
    </div>
  );
}
