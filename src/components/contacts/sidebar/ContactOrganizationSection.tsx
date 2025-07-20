
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Building2, ExternalLink } from 'lucide-react';
import { Contact } from '@/types/Contact';
import { useNavigate } from 'react-router-dom';

interface ContactOrganizationSectionProps {
  contact: Contact;
}

export const ContactOrganizationSection = ({ contact }: ContactOrganizationSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleViewCompany = () => {
    if (contact.company_id) {
      navigate(`/empresas/${contact.company_id}`);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">ORGANIZACIÓN</h3>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {contact.company || contact.company_id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{contact.company}</div>
                    {contact.position && (
                      <div className="text-sm text-muted-foreground">{contact.position}</div>
                    )}
                  </div>
                  {contact.company_id && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleViewCompany}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin organización asociada</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
