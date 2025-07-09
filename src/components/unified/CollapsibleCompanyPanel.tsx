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
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User,
  TrendingUp,
  Star,
  Tag
} from 'lucide-react';
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
      {/* Floating Edit Button */}
      <Button
        size="sm"
        className="absolute top-4 right-4 z-10 h-8 w-8 p-0 shadow-md"
        onClick={() => onEdit(company)}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-4 pr-16">
        <CardTitle className="flex items-center gap-3">
          <Building2 className="h-5 w-5" />
          <span className="text-lg">{company.name}</span>
          <Badge variant={getCompanyStatusBadge(company.company_status) as any}>
            {company.company_status}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {company.industry && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sector:</span>
                <span className="font-medium">{company.industry}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {company.website}
                </a>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={getCompanyTypeBadge(company.company_type) as any}>
                {company.company_type}
              </Badge>
            </div>
            {company.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{company.city}, {company.country || 'España'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information - Collapsible */}
        {(company.phone || company.owner_name) && (
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
                {company.owner_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.owner_name}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${company.phone}`} className="text-sm text-blue-600 hover:underline">
                      {company.phone}
                    </a>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Address Information - Collapsible */}
        {(company.address || company.postal_code) && (
          <Collapsible
            open={expandedSections.has('address')}
            onOpenChange={() => toggleSection('address')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Dirección</span>
              </div>
              {expandedSections.has('address') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md space-y-2">
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
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Financial Information - Collapsible */}
        {(company.annual_revenue || company.founded_year) && (
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
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Social Media - Collapsible */}
        {(company.linkedin_url || company.twitter_url || company.facebook_url) && (
          <Collapsible
            open={expandedSections.has('social')}
            onOpenChange={() => toggleSection('social')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Redes Sociales</span>
              </div>
              {expandedSections.has('social') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md space-y-2">
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
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Notes - Collapsible */}
        {company.notes && (
          <Collapsible
            open={expandedSections.has('notes')}
            onOpenChange={() => toggleSection('notes')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
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
                <p className="text-sm">{company.notes}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Tags */}
        {company.tags && company.tags.length > 0 && (
          <Collapsible
            open={expandedSections.has('tags')}
            onOpenChange={() => toggleSection('tags')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Tags</span>
              </div>
              {expandedSections.has('tags') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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