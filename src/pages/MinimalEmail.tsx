
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              {filteredEmails.length} emails
              {searchQuery && ` (filtrados de ${emails?.length || 0})`}
            </h3>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando emails...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow 
                      key={email.id} 
                      className="cursor-pointer"
                      onClick={() => handleEmailSelect(email)}
                    >
                      <TableCell>
                        <div className="font-medium">{email.recipient_email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-xs">{email.subject}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(email.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(email.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Detalles del Email</h3>
          </div>
          <div className="p-4">
            {selectedEmail ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Destinatario</div>
                  <div className="font-medium">{selectedEmail.recipient_email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Asunto</div>
                  <div className="font-medium">{selectedEmail.subject}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Fecha de envío</div>
                  <div>{formatDate(selectedEmail.created_at)}</div>
                </div>
                {selectedEmail.opened_at && (
                  <div>
                    <div className="text-sm text-gray-500">Fecha de apertura</div>
                    <div>{formatDate(selectedEmail.opened_at)}</div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <Button variant="secondary" className="w-full">
                    Responder
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Selecciona un email para ver los detalles</p>
              </div>
            )}
          </div>
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
