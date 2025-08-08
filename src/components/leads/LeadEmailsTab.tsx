import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/Lead';
import { Mail, Send, Inbox } from 'lucide-react';

interface LeadEmailsTabProps {
  lead: Lead;
}

export const LeadEmailsTab = ({ lead }: LeadEmailsTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Integración de Email</h3>
          <p className="text-muted-foreground mb-6">
            La funcionalidad de email estará disponible próximamente. 
            Podrás ver el historial de emails enviados y recibidos con este lead.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Send className="h-4 w-4" />
              Emails enviados
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-4 w-4" />
              Emails recibidos
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};