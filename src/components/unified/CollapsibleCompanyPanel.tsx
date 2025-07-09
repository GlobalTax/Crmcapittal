import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  User,
  TrendingUp,
  Tag
} from 'lucide-react';
import { FloatingEditButton } from './collapsible/FloatingEditButton';
import { EntityHeader } from './collapsible/EntityHeader';
import { EssentialInfo, EssentialField } from './collapsible/EssentialInfo';
import { CollapsibleSection } from './collapsible/CollapsibleSection';
import { Company } from '@/types/Company';

interface CollapsibleCompanyPanelProps {
  company: Company;
  onEdit: (company: Company) => void;
  onUpdate?: (company: Company) => void;
}

export const CollapsibleCompanyPanel = ({ company, onEdit, onUpdate }: CollapsibleCompanyPanelProps) => {
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

  const getCompanyStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'activa': 'default',
      'cliente': 'default',
      'prospecto': 'secondary',
      'inactiva': 'outline',
      'perdida': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getCompanyTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'cliente': 'default',
      'prospect': 'secondary',
      'partner': 'outline',
      'franquicia': 'outline',
      'competidor': 'destructive',
    };
    return variants[type] || 'secondary';
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
      <FloatingEditButton onClick={() => onEdit(company)} />
      
      <EntityHeader
        icon={<Building2 className="h-5 w-5" />}
        title={company.name}
        badge={
          <Badge variant={getCompanyStatusBadge(company.company_status) as any}>
            {company.company_status}
          </Badge>
        }
      />

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <EssentialInfo>
          <div className="space-y-2">
            {company.industry && (
              <EssentialField label="Sector" value={company.industry} />
            )}
            {company.website && (
              <EssentialField 
                icon={<Globe className="h-4 w-4 text-muted-foreground" />} 
                value={company.website}
                href={company.website}
              />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={getCompanyTypeBadge(company.company_type) as any}>
                {company.company_type}
              </Badge>
            </div>
            {company.city && (
              <EssentialField 
                icon={<MapPin className="h-4 w-4 text-muted-foreground" />} 
                value={`${company.city}, ${company.country || 'España'}`} 
              />
            )}
          </div>
        </EssentialInfo>

        {/* Contact Information - Collapsible */}
        {(company.phone || company.owner_name) && (
          <CollapsibleSection
            title="Información de Contacto"
            icon={<User className="h-4 w-4" />}
            isOpen={expandedSections.has('contact')}
            onToggle={() => toggleSection('contact')}
          >
            <div className="space-y-3">
              {company.owner_name && (
                <EssentialField 
                  icon={<User className="h-4 w-4 text-muted-foreground" />} 
                  value={company.owner_name} 
                />
              )}
              {company.phone && (
                <EssentialField 
                  icon={<Phone className="h-4 w-4 text-muted-foreground" />} 
                  value={company.phone}
                  href={`tel:${company.phone}`}
                />
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Address Information - Collapsible */}
        {(company.address || company.postal_code) && (
          <CollapsibleSection
            title="Dirección"
            icon={<MapPin className="h-4 w-4" />}
            isOpen={expandedSections.has('address')}
            onToggle={() => toggleSection('address')}
          >
            <div className="space-y-2">
              {company.address && (
                <div className="text-sm">{company.address}</div>
              )}
              <div className="text-sm">
                {company.postal_code && `${company.postal_code} `}
                {company.city}{company.state && `, ${company.state}`}
                <br />
                {company.country || 'España'}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Financial Information - Collapsible */}
        {(company.annual_revenue || company.founded_year) && (
          <CollapsibleSection
            title="Información Financiera"
            icon={<TrendingUp className="h-4 w-4" />}
            isOpen={expandedSections.has('financial')}
            onToggle={() => toggleSection('financial')}
          >
            <div className="grid grid-cols-2 gap-4">
              {company.annual_revenue && (
                <div>
                  <span className="text-sm text-muted-foreground">Facturación Anual</span>
                  <div className="font-medium">{formatCurrency(company.annual_revenue)}</div>
                </div>
              )}
              {company.founded_year && (
                <div>
                  <span className="text-sm text-muted-foreground">Año Fundación</span>
                  <div className="font-medium">{company.founded_year}</div>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Tamaño</span>
                <div className="font-medium">{company.company_size}</div>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Social Media - Collapsible */}
        {(company.linkedin_url || company.twitter_url || company.facebook_url) && (
          <CollapsibleSection
            title="Redes Sociales"
            icon={<Globe className="h-4 w-4" />}
            isOpen={expandedSections.has('social')}
            onToggle={() => toggleSection('social')}
          >
            <div className="space-y-2">
              {company.linkedin_url && (
                <div>
                  <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
              {company.twitter_url && (
                <div>
                  <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Twitter
                  </a>
                </div>
              )}
              {company.facebook_url && (
                <div>
                  <a href={company.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Facebook
                  </a>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Notes - Collapsible */}
        {company.notes && (
          <CollapsibleSection
            title="Notas"
            icon={<Tag className="h-4 w-4" />}
            isOpen={expandedSections.has('notes')}
            onToggle={() => toggleSection('notes')}
          >
            <p className="text-sm">{company.notes}</p>
          </CollapsibleSection>
        )}

        {/* Tags */}
        {company.tags && company.tags.length > 0 && (
          <CollapsibleSection
            title="Tags"
            icon={<Tag className="h-4 w-4" />}
            isOpen={expandedSections.has('tags')}
            onToggle={() => toggleSection('tags')}
          >
            <div className="flex flex-wrap gap-2">
              {company.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Metadata */}
        <Separator />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Creado: {new Date(company.created_at).toLocaleDateString('es-ES')}</span>
          <span>Actualizado: {new Date(company.updated_at).toLocaleDateString('es-ES')}</span>
        </div>
      </CardContent>
    </Card>
  );
};