import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  Calendar,
  FileText,
  Star
} from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';

interface CollapsibleTargetPanelProps {
  target: MandateTarget;
  onEdit: (target: MandateTarget) => void;
  onUpdate: (target: MandateTarget) => void;
}

export const CollapsibleTargetPanel = ({ target, onEdit, onUpdate }: CollapsibleTargetPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: MandateTarget['status']) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      in_analysis: 'bg-yellow-100 text-yellow-800',
      interested: 'bg-green-100 text-green-800',
      nda_signed: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: MandateTarget['status']) => {
    const texts = {
      pending: 'Pendiente',
      contacted: 'En Contacto',
      in_analysis: 'En Análisis',
      interested: 'Interesado',
      nda_signed: 'NDA Firmado',
      rejected: 'Rechazado',
      closed: 'Cerrado',
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No disponible';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="relative">
      {/* Floating Edit Button */}
      <Button
        size="sm"
        className="absolute top-4 right-4 z-10 h-8 w-8 p-0 shadow-md"
        onClick={() => onEdit(target)}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-4 pr-16">
        <CardTitle className="flex items-center gap-3">
          <Building2 className="h-5 w-5" />
          <span className="text-lg">{target.company_name}</span>
          <Badge className={getStatusColor(target.status)}>
            {getStatusText(target.status)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {target.sector && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sector:</span>
                <span className="font-medium">{target.sector}</span>
              </div>
            )}
            {target.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{target.location}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {target.revenues && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Facturación: {formatCurrency(target.revenues)}</span>
              </div>
            )}
            {target.contacted && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-green-700">
                  Contactado el {target.contact_date && new Date(target.contact_date).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information - Collapsible */}
        <Collapsible
          open={expandedSections.has('contact')}
          onOpenChange={() => toggleSection('contact')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Información de Contacto</span>
            </div>
            {expandedSections.has('contact') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted/30 p-4 rounded-md space-y-3">
              {target.contact_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{target.contact_name}</span>
                </div>
              )}
              {target.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${target.contact_email}`} className="text-sm text-blue-600 hover:underline">
                    {target.contact_email}
                  </a>
                </div>
              )}
              {target.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${target.contact_phone}`} className="text-sm text-blue-600 hover:underline">
                    {target.contact_phone}
                  </a>
                </div>
              )}
              {target.contact_method && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Método de contacto:</span>
                  <Badge variant="outline" className="text-xs">
                    {target.contact_method}
                  </Badge>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Financial Information - Collapsible */}
        {(target.revenues || target.ebitda) && (
          <Collapsible
            open={expandedSections.has('financial')}
            onOpenChange={() => toggleSection('financial')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Información Financiera</span>
              </div>
              {expandedSections.has('financial') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  {target.revenues && (
                    <div>
                      <span className="text-sm text-muted-foreground">Facturación</span>
                      <div className="font-medium">{formatCurrency(target.revenues)}</div>
                    </div>
                  )}
                  {target.ebitda && (
                    <div>
                      <span className="text-sm text-muted-foreground">EBITDA</span>
                      <div className="font-medium">{formatCurrency(target.ebitda)}</div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Notes - Collapsible */}
        {target.notes && (
          <Collapsible
            open={expandedSections.has('notes')}
            onOpenChange={() => toggleSection('notes')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Notas</span>
              </div>
              {expandedSections.has('notes') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm">{target.notes}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Metadata */}
        <Separator />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Creado: {new Date(target.created_at).toLocaleDateString('es-ES')}</span>
          <span>Actualizado: {new Date(target.updated_at).toLocaleDateString('es-ES')}</span>
        </div>
      </CardContent>
    </Card>
  );
};