
import { useState } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { TrackedEmail } from '@/types/EmailTracking';
import { EmailComposer } from '@/components/email/EmailComposer';

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SENT: { label: "Enviado", color: "blue" as const },
      DELIVERED: { label: "Entregado", color: "green" as const },
      OPENED: { label: "Abierto", color: "green" as const },
      CLICKED: { label: "Clicado", color: "green" as const },
      BOUNCED: { label: "Rebotado", color: "red" as const },
      COMPLAINED: { label: "Marcado spam", color: "red" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "gray" as const };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEmails = emails?.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <p className="text-red-600 mb-2">Error cargando los datos del email</p>
          <p className="text-sm text-gray-500">Por favor, actualiza la página o inténtalo más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Email</h1>
          <p className="text-gray-600 mt-1">Gestiona y envía emails con seguimiento</p>
        </div>
        <Button 
          variant="primary"
          onClick={handleCompose}
        >
          Nuevo Email
        </Button>
      </div>

      {/* Sidebar and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFolder('inbox')}
              className={`px-3 py-2 rounded text-sm ${
                selectedFolder === 'inbox' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bandeja ({emails?.length || 0})
            </button>
            <button
              onClick={() => setSelectedFolder('sent')}
              className={`px-3 py-2 rounded text-sm ${
                selectedFolder === 'sent' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enviados ({emails?.filter(e => e.status === 'SENT').length || 0})
            </button>
            <button
              onClick={() => setSelectedFolder('unread')}
              className={`px-3 py-2 rounded text-sm ${
                selectedFolder === 'unread' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No leídos ({emails?.filter(e => e.status !== 'OPENED').length || 0})
            </button>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Total Emails</span>
          <span className="text-3xl font-bold mt-2 block">{emails?.length || 0}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Enviados</span>
          <span className="text-3xl font-bold mt-2 block text-blue-600">
            {emails?.filter(e => e.status === 'SENT').length || 0}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Abiertos</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">
            {emails?.filter(e => e.status === 'OPENED').length || 0}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Tasa Apertura</span>
          <span className="text-3xl font-bold mt-2 block">
            {emails && emails.length > 0 
              ? Math.round((emails.filter(e => e.status === 'OPENED').length / emails.length) * 100)
              : 0}%
          </span>
        </div>
      </div>

      {/* Classic Email Layout */}
      <div className="bg-white rounded-lg border">
        {/* Email List */}
        <div className="border-b">
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              {filteredEmails.length} emails en {selectedFolder === 'inbox' ? 'Bandeja' : selectedFolder === 'sent' ? 'Enviados' : 'No leídos'}
              {searchQuery && ` (filtrados de ${emails?.length || 0})`}
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando emails...</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredEmails.map((email) => (
                  <div 
                    key={email.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleEmailSelect(email)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 truncate">
                            {email.recipient_email}
                          </span>
                          {getStatusBadge(email.status)}
                        </div>
                        <div className="text-sm font-medium text-gray-800 mt-1 truncate">
                          {email.subject}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 truncate">
                          {email.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Sin contenido'}...
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 ml-4 flex-shrink-0">
                        {formatDate(email.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredEmails.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron emails
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? 
                    "Intenta con otros términos de búsqueda" : 
                    "Envía tu primer email para comenzar"
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Email Detail */}
        <div className="p-6">
          {selectedEmail ? (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedEmail.subject}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-gray-600">Para: {selectedEmail.recipient_email}</span>
                      {getStatusBadge(selectedEmail.status)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedEmail.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.content || 'Sin contenido' }}
                />
              </div>

              {selectedEmail.opened_at && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">
                      Email abierto el {formatDate(selectedEmail.opened_at)}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Veces abierto: {selectedEmail.open_count || 1}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="primary">
                  Responder
                </Button>
                <Button variant="secondary">
                  Reenviar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Selecciona un email</p>
              <p>Elige un email de la lista para ver su contenido completo</p>
            </div>
          )}
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
