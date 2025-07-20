
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Target } from 'lucide-react';
import { Contact } from '@/types/Contact';

interface ContactDealsSectionProps {
  contact: Contact;
}

export const ContactDealsSection = ({ contact }: ContactDealsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mock data - esto se reemplazaría con datos reales
  const deals = [
    { id: '1', name: 'Proyecto Alpha', stage: 'Negociación', value: '€50,000' },
    { id: '2', name: 'Consultoría Beta', stage: 'Propuesta', value: '€25,000' }
  ];

  return (
    <Card className="border-0 shadow-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                NEGOCIOS ({deals.length})
              </h3>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {deals.length > 0 ? (
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div key={deal.id} className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{deal.name}</h4>
                      <span className="text-sm font-medium">{deal.value}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {deal.stage}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin negocios activos</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
