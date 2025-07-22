import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import { FloatingEditButton } from './collapsible/FloatingEditButton';
import { EntityHeader } from './collapsible/EntityHeader';
import { EssentialInfo, EssentialField } from './collapsible/EssentialInfo';
import { CollapsibleSection } from './collapsible/CollapsibleSection';
import { MandateTarget } from '@/types/BuyingMandate';
import { CreateReconversionModal } from '@/components/reconversiones/CreateReconversionModal';

interface CollapsibleTargetPanelProps {
  target: MandateTarget;
  onEdit: (target: MandateTarget) => void;
  onUpdate: (target: MandateTarget) => void;
}

export const CollapsibleTargetPanel = ({ target, onEdit, onUpdate }: CollapsibleTargetPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showReconversionModal, setShowReconversionModal] = useState(false);

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
      <FloatingEditButton onClick={() => onEdit(target)} />
      
      <EntityHeader
        icon={<Building2 className="h-5 w-5" />}
        title={target.company_name}
        badge={
          <Badge className={getStatusColor(target.status)}>
            {getStatusText(target.status)}
          </Badge>
        }
      />

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <EssentialInfo>
          <div className="space-y-2">
            {target.sector && (
              <EssentialField label="Sector" value={target.sector} />
            )}
            {target.location && (
              <EssentialField 
                icon={<MapPin className="h-4 w-4 text-muted-foreground" />} 
                value={target.location} 
              />
            )}
          </div>
          <div className="space-y-2">
            {target.revenues && (
              <EssentialField 
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} 
                value={`Facturación: ${formatCurrency(target.revenues)}`} 
              />
            )}
            {target.contacted && target.contact_date && (
              <EssentialField 
                icon={<Calendar className="h-4 w-4 text-green-500" />} 
                value={`Contactado el ${new Date(target.contact_date).toLocaleDateString('es-ES')}`}
                className="text-green-700"
              />
            )}
          </div>
        </EssentialInfo>

        {/* Contact Information - Collapsible */}
        <CollapsibleSection
          title="Información de Contacto"
          icon={<User className="h-4 w-4" />}
          isOpen={expandedSections.has('contact')}
          onToggle={() => toggleSection('contact')}
        >
          <div className="space-y-3">
            {target.contact_name && (
              <EssentialField 
                icon={<User className="h-4 w-4 text-muted-foreground" />} 
                value={target.contact_name} 
              />
            )}
            {target.contact_email && (
              <EssentialField 
                icon={<Mail className="h-4 w-4 text-muted-foreground" />} 
                value={target.contact_email}
                href={`mailto:${target.contact_email}`}
              />
            )}
            {target.contact_phone && (
              <EssentialField 
                icon={<Phone className="h-4 w-4 text-muted-foreground" />} 
                value={target.contact_phone}
                href={`tel:${target.contact_phone}`}
              />
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
        </CollapsibleSection>

        {/* Financial Information - Collapsible */}
        {(target.revenues || target.ebitda) && (
          <CollapsibleSection
            title="Información Financiera"
            icon={<TrendingUp className="h-4 w-4" />}
            isOpen={expandedSections.has('financial')}
            onToggle={() => toggleSection('financial')}
          >
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
          </CollapsibleSection>
        )}

        {/* Notes - Collapsible */}
        {target.notes && (
          <CollapsibleSection
            title="Notas"
            icon={<FileText className="h-4 w-4" />}
            isOpen={expandedSections.has('notes')}
            onToggle={() => toggleSection('notes')}
          >
            <p className="text-sm">{target.notes}</p>
          </CollapsibleSection>
        )}

        {/* Reconversion Button for Rejected Targets */}
        {target.status === 'rejected' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-red-800">Comprador Rechazado</h4>
                <p className="text-xs text-red-600 mt-1">
                  Este comprador fue rechazado pero podría ser interesante para futuras oportunidades
                </p>
              </div>
              <Button 
                onClick={() => setShowReconversionModal(true)}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Crear Reconversión
              </Button>
            </div>
          </div>
        )}

        {/* Metadata */}
        <Separator />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Creado: {new Date(target.created_at).toLocaleDateString('es-ES')}</span>
          <span>Actualizado: {new Date(target.updated_at).toLocaleDateString('es-ES')}</span>
        </div>
      </CardContent>

      {/* Reconversion Modal */}
      <CreateReconversionModal
        open={showReconversionModal}
        onOpenChange={setShowReconversionModal}
        rejectedTarget={target}
        mandateId={target.mandate_id}
      />
    </Card>
  );
};