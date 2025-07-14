
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { UnifiedCard } from "@/components/ui/unified-card";
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { Mail, Plus, Search } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Modern Page Header */}
      <PageHeader
        title="Email"
        description="Gestiona tu comunicación por correo electrónico"
        actions={
          <Button onClick={handleCompose}>
            <Plus className="h-4 w-4 mr-2" />
            Redactar
          </Button>
        }
      />

      {/* Navigation and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant={selectedFolder === 'inbox' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFolder('inbox')}
            >
              Inbox
            </Button>
            <Button
              variant={selectedFolder === 'sent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFolder('sent')}
            >
              Enviados
            </Button>
            <Button
              variant={selectedFolder === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFolder('unread')}
            >
              No leídos
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de emails */}
        <UnifiedCard title="Emails" className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground mb-2">No hay emails</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Intenta con otros términos" : "Envía tu primer email"}
              </p>
            </div>
          ) : (
            <div className="space-y-px max-h-96 overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 cursor-pointer transition-colors border-l-2 ${
                    selectedEmail?.id === email.id 
                      ? 'bg-accent border-primary' 
                      : 'border-transparent hover:bg-accent'
                  }`}
                  onClick={() => handleEmailSelect(email)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusIndicator(email.status)}`}></div>
                      <span className="text-sm font-medium text-foreground truncate">
                        {email.recipient_email}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(email.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground truncate mb-1">
                    {email.subject || 'Sin asunto'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email.content?.replace(/<[^>]*>/g, '').substring(0, 80) || 'Sin contenido'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </UnifiedCard>

        {/* Detalle del email */}
        <UnifiedCard title={selectedEmail ? "Detalle del Email" : "Email"}>
          {selectedEmail ? (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-medium text-foreground">
                    {selectedEmail.subject || 'Sin asunto'}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedEmail.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Para: {selectedEmail.recipient_email}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${getStatusIndicator(selectedEmail.status)}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {selectedEmail.status === 'SENT' && 'Enviado'}
                    {selectedEmail.status === 'OPENED' && 'Abierto'}
                    {selectedEmail.status === 'CLICKED' && 'Clic'}
                  </span>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div 
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedEmail.content || 'Sin contenido' 
                  }}
                />
              </div>

              {selectedEmail.opened_at && (
                <div className="bg-success/10 p-3 text-sm rounded-lg border border-success/20">
                  <p className="text-success">
                    Abierto el {formatDate(selectedEmail.opened_at)}
                  </p>
                  {selectedEmail.open_count > 1 && (
                    <p className="text-success/80 text-xs">
                      {selectedEmail.open_count} veces
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button size="sm">
                  Responder
                </Button>
                <Button variant="outline" size="sm">
                  Reenviar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-muted flex items-center justify-center rounded-lg">
                  <Mail className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-sm">Selecciona un email</p>
              </div>
            </div>
          )}
        </UnifiedCard>
      </div>

      <EmailComposer
        isOpen={isComposerOpen}
        onClose={handleCloseComposer}
        recipientEmail={selectedEmail?.recipient_email}
      />
    </div>
  );
}
