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
      {/* Floating Edit Button */}
      <Button
        size="sm"
        className="absolute top-4 right-4 z-10 h-8 w-8 p-0 shadow-md"
        onClick={() => onEdit(lead)}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-4 pr-16">
        <CardTitle className="flex items-center gap-3">
          <User className="h-5 w-5" />
          <span className="text-lg">{lead.name}</span>
          <LeadStatusBadge status={lead.status} />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Score: {lead.lead_score}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(lead.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        {/* Company Information - Collapsible */}
        {(lead.company_name || lead.job_title) && (
          <Collapsible
            open={expandedSections.has('company')}
            onOpenChange={() => toggleSection('company')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Información de Empresa</span>
              </div>
              {expandedSections.has('company') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md space-y-3">
                {lead.company_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.company_name}</span>
                  </div>
                )}
                {lead.job_title && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.job_title}</span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Metrics - Collapsible */}
        <Collapsible
          open={expandedSections.has('metrics')}
          onOpenChange={() => toggleSection('metrics')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Métricas y Calidad</span>
            </div>
            {expandedSections.has('metrics') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted/30 p-4 rounded-md">
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
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Engagement Stats - Collapsible */}
        <Collapsible
          open={expandedSections.has('engagement')}
          onOpenChange={() => toggleSection('engagement')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">Engagement</span>
            </div>
            {expandedSections.has('engagement') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted/30 p-4 rounded-md">
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
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Message - Collapsible */}
        {lead.message && (
          <Collapsible
            open={expandedSections.has('message')}
            onOpenChange={() => toggleSection('message')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Mensaje Inicial</span>
              </div>
              {expandedSections.has('message') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm">{lead.message}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Tags - Collapsible */}
        {lead.tags && lead.tags.length > 0 && (
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
                  {lead.tags.map((tag, index) => (
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
          <span>Creado: {new Date(lead.created_at).toLocaleDateString('es-ES')}</span>
          {lead.assigned_to && (
            <span>Asignado a: {lead.assigned_to.first_name} {lead.assigned_to.last_name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};