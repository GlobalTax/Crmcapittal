import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Lead } from '@/types/Lead';
import { useLeadActions } from '@/hooks/leads/useLeadActions';

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
  Phone,
  TrendingUp
} from 'lucide-react';
import { LeadOverviewTab } from './tabs/LeadOverviewTab';
import { LeadActivityTab } from './LeadActivityTab';
import { LeadUnifiedActivityTab } from './LeadUnifiedActivityTab';
import { LeadNotesTab } from './LeadNotesTab';
import { LeadTasksTab } from './tabs/LeadTasksTab';

import { LeadSidebarWidgets } from './widgets/LeadSidebarWidgets';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageUpdate?: (leadId: string, newStage: string) => void;
}

export const LeadDetailDrawer = ({ lead, open, onOpenChange, onStageUpdate }: LeadDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const { deleteLead, convertToDeal, isDeleting, isConverting } = useLeadActions();

  const handleActionClick = (action: string) => {
    if (!lead) return;

    switch (action) {
      case 'email':
        // Open email client with lead email
        if (lead.email) {
          window.location.href = `mailto:${lead.email}?subject=Contacto comercial - ${lead.company || lead.name}`;
        }
        break;
      case 'call':
        // Open phone dialer
        if (lead.phone) {
          window.location.href = `tel:${lead.phone}`;
        }
        break;
      case 'convert':
        convertToDeal(lead.id);
        break;
      case 'copy':
        // Copy lead link to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/leads/${lead.id}`);
        break;
      case 'delete':
        if (window.confirm('¿Estás seguro de que quieres eliminar este lead?')) {
          deleteLead(lead.id);
          onOpenChange(false);
        }
        break;
      case 'close':
        onOpenChange(false);
        break;
      default:
        console.log('Unknown action:', action);
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
              onClick={() => handleActionClick('email')}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('call')}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('convert')}
              disabled={isConverting}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {isConverting ? 'Convirtiendo...' : 'Convertir'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('copy')}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('delete')}
              disabled={isDeleting}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('close')}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main content area */}
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
                </TabsList>
              </div>

              {/* Tab content with scroll */}
              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="resumen" className="mt-0">
                  <LeadOverviewTab lead={lead} />
                </TabsContent>
                
                 <TabsContent value="actividades" className="mt-0">
                   <div className="space-y-6">
                     <LeadUnifiedActivityTab lead={lead} />
                     <details className="group">
                       <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                         Ver timeline tradicional
                       </summary>
                       <div className="mt-4">
                         <LeadActivityTab lead={lead} />
                       </div>
                     </details>
                   </div>
                 </TabsContent>
                
                <TabsContent value="notas" className="mt-0">
                  <LeadNotesTab lead={lead} />
                </TabsContent>
                
                <TabsContent value="tareas" className="mt-0">
                  <LeadTasksTab lead={lead} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border bg-muted/30 p-6 overflow-y-auto">
            <LeadSidebarWidgets lead={lead} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};