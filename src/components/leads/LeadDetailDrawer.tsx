import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Lead } from '@/types/Lead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Copy, 
  FileText, 
  Trash2, 
  X, 
  Activity, 
  StickyNote, 
  CheckSquare, 
  Target,
  Phone
} from 'lucide-react';
import { LeadOverviewTab } from './tabs/LeadOverviewTab';
import { LeadActivityTab } from './LeadActivityTab';
import { LeadNotesTab } from './LeadNotesTab';
import { LeadTasksTab } from './tabs/LeadTasksTab';
import { LeadProposalTab } from './tabs/LeadProposalTab';
import { toast } from 'sonner';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageUpdate?: (leadId: string, newStage: string) => void;
}

export const LeadDetailDrawer = ({ lead, open, onOpenChange, onStageUpdate }: LeadDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState('resumen');

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'compose-email':
        toast.info('Email composer would open here');
        break;
      case 'copy-link':
        if (lead) {
          navigator.clipboard.writeText(`${window.location.origin}/leads/${lead.id}`);
          toast.success('Link del lead copiado al portapapeles');
        }
        break;
      case 'convert':
        toast.info('Convert to deal functionality would open here');
        break;
      case 'call':
        toast.info('Call functionality would open here');
        break;
      case 'delete':
        toast.info('Delete confirmation would appear here');
        break;
    }
  };

  // Handle body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [open]);

  // Get stage color based on pipeline stage
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Pipeline': 'hsl(213, 94%, 68%)',
      'Cualificado': 'hsl(42, 100%, 50%)',
      'Propuesta': 'hsl(280, 100%, 70%)',
      'Negociación': 'hsl(30, 100%, 50%)',
      'Ganado': 'hsl(158, 100%, 38%)',
      'Perdido': 'hsl(4, 86%, 63%)'
    };
    return colors[stage] || 'hsl(210, 11%, 71%)';
  };

  // Check if proposal tab should be visible
  const shouldShowProposalTab = (lead: Lead) => {
    const proposalStages = ['propuesta', 'negociacion', 'ganado'];
    return lead.stage && proposalStages.includes(lead.stage);
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-4xl p-0 gap-0 bg-background border-l border-border"
        aria-labelledby="lead-drawer-title"
      >
        {/* Header with title and actions */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 
              id="lead-drawer-title"
              className="text-lg font-semibold text-foreground truncate"
              tabIndex={-1}
            >
              {lead.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStageColor(lead.stage || '') }}
              />
              <Badge variant="secondary" className="text-xs">
                {lead.stage || 'Sin etapa'}
              </Badge>
              {lead.company_name && (
                <span className="text-sm text-muted-foreground">• {lead.company_name}</span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('compose-email')}
              aria-label="Enviar email"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('call')}
              aria-label="Llamar"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('convert')}
              aria-label="Convertir a oportunidad"
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('copy-link')}
              aria-label="Copiar enlace"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('delete')}
              className="text-destructive hover:text-destructive"
              aria-label="Eliminar lead"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ml-2"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            {/* Tabs navigation */}
            <div className="px-6 border-b border-border">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                <TabsTrigger 
                  value="resumen"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                >
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="actividades"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Actividades
                </TabsTrigger>
                <TabsTrigger 
                  value="notas"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  Notas
                </TabsTrigger>
                <TabsTrigger 
                  value="tareas"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tareas
                </TabsTrigger>
                {shouldShowProposalTab(lead) && (
                  <TabsTrigger 
                    value="propuesta"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Propuesta
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Tab content with scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="resumen" className="mt-0">
                <LeadOverviewTab lead={lead} />
              </TabsContent>
              
              <TabsContent value="actividades" className="mt-0">
                <LeadActivityTab lead={lead} />
              </TabsContent>
              
              <TabsContent value="notas" className="mt-0">
                <LeadNotesTab lead={lead} />
              </TabsContent>
              
              <TabsContent value="tareas" className="mt-0">
                <LeadTasksTab lead={lead} />
              </TabsContent>
              
              {shouldShowProposalTab(lead) && (
                <TabsContent value="propuesta" className="mt-0">
                  <LeadProposalTab lead={lead} />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};