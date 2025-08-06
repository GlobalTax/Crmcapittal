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
  ArrowRight
} from 'lucide-react';
import { LeadOverviewTab } from './tabs/LeadOverviewTab';
import { LeadActivityTab } from './tabs/LeadActivityTab';
import { LeadNotesTab } from './LeadNotesTab';
import { LeadTasksTab } from './tabs/LeadTasksTab';
import { useLeadActions } from '@/hooks/leads/useLeadActions';
import { toast } from 'sonner';
import { getCacheBusterId, DEFINITIVO_4_TABS } from '@/utils/cacheBuster';
import './leads-styles.css';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// CACHE BUSTER DEFINITIVO - Forzar recarga total del componente
const COMPONENT_ID = getCacheBusterId('lead_drawer');

export const LeadDetailDrawer = ({ lead, open, onOpenChange }: LeadDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const { deleteLead, convertToDeal, isDeleting, isConverting } = useLeadActions();

  // VERIFICACIÓN FINAL: Solo estos 4 tabs existen
  console.log('🎯 TABS DEFINITIVOS CARGADOS:', DEFINITIVO_4_TABS);
  console.log('🔄 Component Cache Buster ID:', COMPONENT_ID);
  console.log('✅ Timestamp de carga:', new Date().toISOString());

  const handleActionClick = (action: string) => {
    if (!lead) return;

    switch (action) {
      case 'compose-email':
        toast.info('Compositor de email se abriría aquí');
        break;
      case 'copy-link':
        navigator.clipboard.writeText(`${window.location.origin}/leads/${lead.id}`);
        toast.success('Enlace del lead copiado al portapapeles');
        break;
      case 'clone':
        toast.info('Funcionalidad de clonar lead se abriría aquí');
        break;
      case 'delete':
        handleDelete();
        break;
      case 'convert':
        handleConvert();
        break;
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      try {
        await deleteLead(lead.id);
        toast.success('Lead eliminado correctamente');
        onOpenChange(false);
      } catch (error) {
        toast.error('Error al eliminar el lead');
      }
    }
  };

  const handleConvert = async () => {
    if (!lead) return;
    
    try {
      await convertToDeal(lead.id);
      toast.success('Lead convertido a deal correctamente');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al convertir el lead');
    }
  };

  // Control de scroll del body cuando el drawer está abierto
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

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="drawer-lead p-0 gap-0 bg-background border-l border-border"
        key={COMPONENT_ID}
        aria-labelledby="lead-drawer-title"
      >
        {/* Encabezado con título y acciones */}
        <div className="header-lead flex items-center justify-between border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 
              id="lead-drawer-title"
              className="text-lg font-semibold text-foreground truncate"
              tabIndex={-1}
            >
              {lead.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {lead.status}
              </Badge>
              {lead.company && (
                <Badge variant="outline" className="text-xs">
                  {lead.company}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('compose-email')}
              className="btn-icon"
              aria-label="Componer email"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('copy-link')}
              className="btn-icon"
              aria-label="Copiar enlace del lead"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('clone')}
              className="btn-icon"
              aria-label="Clonar lead"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('convert')}
              className="btn-icon text-green-600 hover:text-green-700"
              aria-label="Convertir a deal"
              disabled={isConverting}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('delete')}
              className="btn-icon text-destructive hover:text-destructive"
              aria-label="Eliminar lead"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="btn-icon ml-2"
              aria-label="Cerrar drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Área de contenido principal */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            {/* DEFINITIVO: SOLO 4 PESTAÑAS FINALES */}
            <div className="px-6 border-b border-border">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                {DEFINITIVO_4_TABS.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* CONTENIDO DE LAS 4 PESTAÑAS FINALES */}
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
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
