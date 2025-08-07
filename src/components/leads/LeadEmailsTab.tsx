import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/Lead';
import { Mail, Send, Inbox, Eye, Plus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { EmailAssistantDialog } from './email/EmailAssistantDialog';
import { useLeadEmails } from '@/hooks/useLeadEmails';
import { Textarea } from '@/components/ui/textarea';
import { emailAssistant } from '@/services/emailAssistant';

interface LeadEmailsTabProps {
  lead: Lead;
}

export const LeadEmailsTab = ({ lead }: LeadEmailsTabProps) => {
  const [open, setOpen] = useState(false);
  const { data: emails = [] } = useLeadEmails(lead.id);
  const [receivedText, setReceivedText] = useState('');
  const sentiment = receivedText ? emailAssistant.analyzeSentiment(receivedText) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Emails</h3>
          <p className="text-muted-foreground text-sm">Envío con tracking y análisis básico</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Redactar Email Inteligente
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Send className="h-4 w-4" /> Enviados: <span className="font-medium text-foreground">{emails.length}</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /> Aperturas: <span className="font-medium text-foreground">{emails.reduce((a, e) => a + (e.open_count || 0), 0)}</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><Inbox className="h-4 w-4" /> Recibidos: <span className="font-medium text-foreground">—</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> Último envío: <span className="font-medium text-foreground">{emails[0]?.sent_at ? new Date(emails[0].sent_at).toLocaleString() : '—'}</span></div>
          </div>
        </CardContent>
      </Card>

      {emails.length > 0 && (
        <Card>
          <CardContent className="p-0 divide-y">
            {emails.map(e => (
              <div key={e.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.to_email} • {e.status.toUpperCase()}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground"><Eye className="h-4 w-4" /> {e.open_count}</div>
                  <div className="text-muted-foreground">{e.last_open_at ? new Date(e.last_open_at).toLocaleString() : '—'}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2"><Smile className="h-4 w-4" /><h4 className="font-medium">Análisis de sentimiento (emails recibidos)</h4></div>
          <Textarea rows={4} placeholder="Pega aquí un email recibido para analizar sentimiento" value={receivedText} onChange={e => setReceivedText(e.target.value)} />
          {sentiment && (
            <div className="text-sm">Resultado: <span className="font-medium capitalize">{sentiment.label}</span> (score {sentiment.score})</div>
          )}
        </CardContent>
      </Card>

      <EmailAssistantDialog lead={lead} open={open} onOpenChange={setOpen} />
    </div>
  );
};
