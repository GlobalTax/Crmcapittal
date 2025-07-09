import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  Target,
  Tag,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { FloatingEditButton } from './collapsible/FloatingEditButton';
import { EntityHeader } from './collapsible/EntityHeader';
import { EssentialInfo, EssentialField } from './collapsible/EssentialInfo';
import { CollapsibleSection } from './collapsible/CollapsibleSection';
import { Lead } from '@/types/Lead';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';

interface CollapsibleLeadPanelProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onUpdate?: (lead: Lead) => void;
}

export const CollapsibleLeadPanel = ({ lead, onEdit, onUpdate }: CollapsibleLeadPanelProps) => {
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

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800'
  };

  const qualityColors = {
    POOR: 'bg-red-100 text-red-800',
    FAIR: 'bg-yellow-100 text-yellow-800',
    GOOD: 'bg-green-100 text-green-800',
    EXCELLENT: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <Card className="relative">
      <FloatingEditButton onClick={() => onEdit(lead)} />
      
      <EntityHeader
        icon={<User className="h-5 w-5" />}
        title={lead.name}
        badge={<LeadStatusBadge status={lead.status} />}
      />

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <EssentialInfo>
          <div className="space-y-2">
            <EssentialField 
              icon={<Mail className="h-4 w-4 text-muted-foreground" />} 
              value={lead.email}
              href={`mailto:${lead.email}`}
            />
            {lead.phone && (
              <EssentialField 
                icon={<Phone className="h-4 w-4 text-muted-foreground" />} 
                value={lead.phone}
                href={`tel:${lead.phone}`}
              />
            )}
          </div>
          <div className="space-y-2">
            <EssentialField 
              icon={<Star className="h-4 w-4 text-yellow-500" />} 
              value={`Score: ${lead.lead_score}`} 
            />
            <EssentialField 
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />} 
              value={new Date(lead.created_at).toLocaleDateString('es-ES')} 
            />
          </div>
        </EssentialInfo>

        {/* Company Information - Collapsible */}
        {(lead.company_name || lead.job_title) && (
          <CollapsibleSection
            title="Información de Empresa"
            icon={<Building2 className="h-4 w-4" />}
            isOpen={expandedSections.has('company')}
            onToggle={() => toggleSection('company')}
          >
            <div className="space-y-3">
              {lead.company_name && (
                <EssentialField 
                  icon={<Building2 className="h-4 w-4 text-muted-foreground" />} 
                  value={lead.company_name} 
                />
              )}
              {lead.job_title && (
                <EssentialField 
                  icon={<Tag className="h-4 w-4 text-muted-foreground" />} 
                  value={lead.job_title} 
                />
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Metrics - Collapsible */}
        <CollapsibleSection
          title="Métricas y Calidad"
          icon={<TrendingUp className="h-4 w-4" />}
          isOpen={expandedSections.has('metrics')}
          onToggle={() => toggleSection('metrics')}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Prioridad</span>
                <div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${priorityColors[lead.priority || 'MEDIUM']}`}
                  >
                    {lead.priority || 'MEDIUM'}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Calidad</span>
                <div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${qualityColors[lead.quality || 'FAIR']}`}
                  >
                    {lead.quality || 'FAIR'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Seguimientos</span>
                <div className="font-medium">{lead.follow_up_count || 0}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fuente</span>
                <div>
                  <Badge variant="outline" className="text-xs">
                    {lead.source.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Engagement Stats - Collapsible */}
        <CollapsibleSection
          title="Engagement"
          icon={<Target className="h-4 w-4" />}
          isOpen={expandedSections.has('engagement')}
          onToggle={() => toggleSection('engagement')}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aperturas email:</span>
              <span className="font-medium">{lead.email_opens || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clicks email:</span>
              <span className="font-medium">{lead.email_clicks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visitas web:</span>
              <span className="font-medium">{lead.website_visits || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descargas:</span>
              <span className="font-medium">{lead.content_downloads || 0}</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* Message - Collapsible */}
        {lead.message && (
          <CollapsibleSection
            title="Mensaje Inicial"
            icon={<MessageSquare className="h-4 w-4" />}
            isOpen={expandedSections.has('message')}
            onToggle={() => toggleSection('message')}
          >
            <p className="text-sm">{lead.message}</p>
          </CollapsibleSection>
        )}

        {/* Tags - Collapsible */}
        {lead.tags && lead.tags.length > 0 && (
          <CollapsibleSection
            title="Tags"
            icon={<Tag className="h-4 w-4" />}
            isOpen={expandedSections.has('tags')}
            onToggle={() => toggleSection('tags')}
          >
            <div className="flex flex-wrap gap-2">
              {lead.tags.map((tag, index) => (
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
          <span>Creado: {new Date(lead.created_at).toLocaleDateString('es-ES')}</span>
          {lead.assigned_to && (
            <span>Asignado a: {lead.assigned_to.first_name} {lead.assigned_to.last_name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};