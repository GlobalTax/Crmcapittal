
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Building2 } from 'lucide-react';
import { Contact } from '@/types/Contact';

interface ContactSummarySectionProps {
  contact: Contact;
}

export const ContactSummarySection = ({ contact }: ContactSummarySectionProps) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">RESUMEN</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{contact.name}</div>
            {contact.position && (
              <div className="text-sm text-muted-foreground">{contact.position}</div>
            )}
          </div>
        </div>

        {contact.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${contact.email}`} className="text-sm hover:text-primary">
              {contact.email}
            </a>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${contact.phone}`} className="text-sm hover:text-primary">
              {contact.phone}
            </a>
          </div>
        )}

        {contact.company && (
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{contact.company}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
