
import { useEmailTracking } from "@/hooks/useEmailTracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailStatusIndicator } from "./EmailStatusIndicator";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Mail } from "lucide-react";

interface EmailHistoryProps {
  lead_id?: string;
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
}

export const EmailHistory = ({ lead_id, contact_id, target_company_id, operation_id }: EmailHistoryProps) => {
  const { emails, isLoading } = useEmailTracking({
    lead_id,
    contact_id,
    target_company_id,
    operation_id
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Historial de Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Historial de Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay emails enviados aún.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Historial de Emails ({emails.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email.id} className="flex items-start space-x-3 p-3 rounded-lg border">
              <EmailStatusIndicator 
                status={email.status} 
                openedAt={email.opened_at}
                openCount={email.open_count}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {email.subject || "Sin asunto"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(email.sent_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Para: {email.recipient_email}
                </p>
                {email.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {email.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
