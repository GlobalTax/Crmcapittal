import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Building2, Edit, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Company } from '@/types/Company';
import { CompanyDataPanel } from './CompanyDataPanel';
import { CompanyCRMPanel } from './CompanyCRMPanel';
import { CompanyProfileScore } from './CompanyProfileScore';
import { useCompanyEnrichments } from '@/hooks/useCompanyEnrichments';
import { useCompanyStats } from '@/hooks/useCompanyStats';
import { useCompanyProfileScore } from '@/hooks/useCompanyProfileScore';
import { einformaService } from '@/services/einformaService';
import { toast } from 'sonner';
import { createLogger } from '@/utils/productionLogger';

interface CompanyDrawerProps {
  company: Company | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
  // Navigation props
  companies?: Company[];
  currentIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export const CompanyDrawer = ({
  company,
  open,
  onClose,
  onEdit,
  onDelete,
  companies = [],
  currentIndex = 0,
  onNavigate
}: CompanyDrawerProps) => {
  const [showEinformaDialog, setShowEinformaDialog] = useState(false);
  const [isEnrichingFromEinforma, setIsEnrichingFromEinforma] = useState(false);
  const logger = createLogger('CompanyDrawer');

  // Hooks for data
  const { enrichmentData, isLoading: enrichmentLoading } = useCompanyEnrichments(company?.id || '');
  const stats = useCompanyStats(company?.id || '', company?.name);
  const profileScore = useCompanyProfileScore(company, enrichmentData);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Navigation with arrow keys
      if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
        e.preventDefault();
        onNavigate('prev');
      }
      if (e.key === 'ArrowRight' && onNavigate && currentIndex < companies.length - 1) {
        e.preventDefault();
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onNavigate, currentIndex, companies.length]);

  const handleEinformaEnrichment = async () => {
    if (!company || !(company as any).nif) return;
    
    setIsEnrichingFromEinforma(true);
    setShowEinformaDialog(false);
    
    try {
      const result = await einformaService.enrichCompanyWithEInforma((company as any).nif);
      
      if (result.success) {
        toast.success(result.message);
        // Trigger a refresh of the company data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.message || 'Error al consultar eInforma');
      }
    } catch (error) {
      logger.error('Error enriching company', { error, companyId: company?.id, nif: (company as any)?.nif });
      toast.error('Error inesperado al consultar eInforma');
    } finally {
      setIsEnrichingFromEinforma(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCompanyStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'activa': 'default',
      'cliente': 'default',
      'prospecto': 'secondary',
      'inactiva': 'outline',
      'perdida': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getCompanyTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      'cliente': 'default',
      'prospect': 'secondary',
      'partner': 'outline',
      'franquicia': 'outline',
      'competidor': 'destructive',
    };
    return variants[type] || 'secondary';
  };

  if (!company) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full bg-background border-l border-border shadow-lg z-50 transform transition-transform duration-300 
          ${open ? 'translate-x-0' : 'translate-x-full'}
          w-[800px] max-w-[800px]
          md:w-[800px]
          max-md:w-full max-md:left-0
        `}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold truncate">{company.name}</h1>
                  {/* Navigation */}
                  {companies.length > 1 && onNavigate && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('prev')}
                        disabled={currentIndex <= 0}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        {currentIndex + 1} / {companies.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('next')}
                        disabled={currentIndex >= companies.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Sector line */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-muted-foreground">
                    {enrichmentData?.sector || company.industry || 'Sector no especificado'}
                  </span>
                  {enrichmentData?.sector && (
                    <Badge variant="outline" className="text-xs">eInforma</Badge>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2">
                  <Badge variant={getCompanyStatusBadge(company.company_status)}>
                    {company.company_status}
                  </Badge>
                  <Badge variant={getCompanyTypeBadge(company.company_type)}>
                    {company.company_type}
                  </Badge>
                </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => onEdit?.(company)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Empresa
                </Button>
                
                {/* eInforma Button - Only show if company has NIF */}
                {(company as any).nif && (
                  <Button
                    variant="outline"
                    onClick={() => setShowEinformaDialog(true)}
                    disabled={isEnrichingFromEinforma}
                    className="gap-2"
                  >
                    {isEnrichingFromEinforma ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    Actualizar desde eInforma
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Profile Score */}
            <CompanyProfileScore profileScore={profileScore} />

            {/* Data Panel */}
            <CompanyDataPanel 
              company={company} 
              enrichmentData={enrichmentData} 
            />

            {/* CRM Panel */}
            <CompanyCRMPanel
              companyId={company.id}
              companyName={company.name}
              stats={stats}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Creado: {formatDate(company.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Actualizado: {formatDate(company.updated_at)}</span>
                </div>
              </div>
              {enrichmentData?.fechaActualizacion && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>eInforma: {formatDate(enrichmentData.fechaActualizacion)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* eInforma Confirmation Dialog */}
      <AlertDialog open={showEinformaDialog} onOpenChange={setShowEinformaDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Consultar eInforma</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas usar un crédito para consultar eInforma para esta empresa?
              <br />
              <br />
              Esto actualizará la información de <strong>{company.name}</strong> con datos del registro mercantil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEinformaEnrichment}>
              {isEnrichingFromEinforma ? 'Consultando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};