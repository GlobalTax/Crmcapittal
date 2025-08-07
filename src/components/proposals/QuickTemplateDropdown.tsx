import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FileText, Building, TrendingUp, Search, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProposalTemplates } from '@/hooks/useProposalTemplates';

interface QuickTemplateDropdownProps {
  onTemplateSelect: (templateId: string) => void;
}

export const QuickTemplateDropdown: React.FC<QuickTemplateDropdownProps> = ({
  onTemplateSelect
}) => {
  const { toast } = useToast();
  const { templates } = useProposalTemplates();
  const [isOpen, setIsOpen] = useState(false);

  // Quick templates based on common M&A services
  const quickTemplates = [
    {
      id: 'ma-advisory',
      name: 'M&A Advisory Standard',
      description: 'Asesoría integral en fusiones y adquisiciones',
      icon: Building,
      category: 'M&A',
      estimated_value: '€75,000'
    },
    {
      id: 'company-valuation',
      name: 'Company Valuation',
      description: 'Valoración completa de empresas',
      icon: TrendingUp,
      category: 'Valoración',
      estimated_value: '€25,000'
    },
    {
      id: 'due-diligence',
      name: 'Due Diligence',
      description: 'Análisis exhaustivo financiero y legal',
      icon: Search,
      category: 'DD',
      estimated_value: '€45,000'
    },
    {
      id: 'financial-advisory',
      name: 'Financial Advisory',
      description: 'Asesoría financiera estratégica',
      icon: FileText,
      category: 'Advisory',
      estimated_value: '€35,000'
    }
  ];

  const handleQuickCreate = (template: any) => {
    setIsOpen(false);
    
    toast({
      title: "Creando propuesta...",
      description: `Usando plantilla: ${template.name}`
    });

    // Simulate quick creation with template data
    setTimeout(() => {
      onTemplateSelect(template.id);
      toast({
        title: "Propuesta creada",
        description: "Propuesta creada exitosamente desde plantilla. Ahora puedes editarla."
      });
    }, 1000);
  };

  const handleCustomCreate = () => {
    setIsOpen(false);
    onTemplateSelect('custom');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Propuesta
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white border border-slate-200 shadow-lg"
        style={{ zIndex: 50 }}
      >
        <div className="px-3 py-2 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Plantillas Rápidas</h3>
          <p className="text-xs text-slate-500 mt-1">
            Crea propuestas instantáneamente con datos preconfigurados
          </p>
        </div>

        {quickTemplates.map((template) => {
          const IconComponent = template.icon;
          return (
            <DropdownMenuItem
              key={template.id}
              className="p-3 cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-b-0"
              onClick={() => handleQuickCreate(template)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <IconComponent className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-900 text-sm truncate">
                      {template.name}
                    </h4>
                    <span className="text-xs text-green-600 font-medium">
                      {template.estimated_value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {template.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Zap className="h-3 w-3" />
                      <span>Creación rápida</span>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="p-3 cursor-pointer hover:bg-slate-50"
          onClick={handleCustomCreate}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="bg-slate-100 p-2 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 text-sm">
                Propuesta Personalizada
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Crear desde cero con el asistente completo
              </p>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};